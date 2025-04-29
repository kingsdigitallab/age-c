import json
import logging
from pathlib import Path
from typing import Union

import pandas as pd
from pandas import DataFrame
from slugify import slugify

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

FILE_PREFIX: str = "TheBeast2018-2023_20250305"
DATA_DIR: Path = Path("../data")
RAW_DIR: Path = DATA_DIR / "0_raw"
INTERIM_DIR: Path = DATA_DIR / "1_interim"
FINAL_DIR: Path = DATA_DIR / "2_final"


def main() -> None:
    """Main execution function."""
    try:
        films_df = combine_films_data()
        films_df = aggregate_films_data(films_df)
        logger.info(f"Aggregated films dataframe with {len(films_df)} rows")
        save_data(films_df, "films", individual=True)

        biog_df = combine_bio_data()
        biog_df = aggregate_bio_data(biog_df)
        logger.info(f"Aggregated biographies dataframe with {len(biog_df)} rows")
        save_data(biog_df, "biographies", individual=True)

        corpus_df = pd.concat([films_df, biog_df], ignore_index=True)
        logger.info(f"Concatenated dataframe with {len(corpus_df)} rows")
        save_data(corpus_df, "corpus", individual=False)
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise


def combine_films_data() -> DataFrame:
    """Combine all the films data from the raw files into a single dataframe."""
    try:
        main_df = process_main()

        # Process director data
        director_df = process_biographies()
        director_df.columns = [
            "person_id",
            "person_name",
            "birth_year",
            "death_year",
            "gender",
            "person_nat",
            "slug",
        ]

        # Create nested director object
        director_df["director_obj"] = director_df.apply(
            lambda x: {
                "id": x["person_id"],
                "slug": x["slug"],
                "name": x["person_name"],
                "birthYear": x["birth_year"],
                "deathYear": x["death_year"],
                "gender": x["gender"],
                "nationality": x["person_nat"],
            },
            axis=1,
        )

        # Merge director data
        main_df = main_df.merge(
            director_df[["person_id", "director_obj"]],
            left_on="director",
            right_on="person_id",
            how="left",
        )

        main_df = main_df.drop(columns=["director", "person_id"])
        main_df = main_df.rename(columns={"director_obj": "director"})

        character_tags_df = process_characters()

        main_df = main_df.merge(
            character_tags_df[["film_id", "character_obj"]],
            left_on="id",
            right_on="film_id",
            how="left",
        )
        main_df = main_df.rename(columns={"character_obj": "character"})

        return main_df
    except Exception as e:
        logger.error(f"Error combining films data: {str(e)}")
        raise


def process_main() -> DataFrame:
    """Process main data.

    Returns:
        A dataframe with the main data
    """
    main_df = load_data(
        RAW_DIR / "The-Beast-2018-2023-main-v4.csv", sep=";", skiprows=1
    )

    main_df["type"] = "film"
    main_df["slug"] = main_df.apply(
        lambda x: slugify(f"{x['film_id']}-{x['nat_title']}"), axis=1
    )

    # Process title
    main_df["eng_title"] = main_df["eng_title"].fillna("")
    main_df["title"] = main_df.apply(
        lambda x: {
            "native": x["nat_title"].strip(),
            "english": x["eng_title"].strip(),
        },
        axis=1,
    )
    main_df = main_df.drop(columns=["nat_title", "eng_title"])

    # Process release
    main_df["release_date"] = pd.to_datetime(
        main_df["release_date"], errors="coerce", format="mixed", cache=True
    )
    main_df["release_year"] = main_df["release_date"].dt.year
    main_df["release_year"] = main_df["release_year"].fillna(0).astype(int)
    main_df["release"] = main_df.apply(
        lambda x: {
            "type": x["release_type"],
            "date": x["release_date"],
            "year": x["release_year"],
        },
        axis=1,
    )
    main_df = main_df.drop(columns=["release_type", "release_date", "release_year"])

    # Split directors and explode into separate rows
    main_df["director"] = main_df["director"].str.split(", ")
    main_df = main_df.explode("director")
    main_df["director"] = main_df["director"].str.strip()

    # Process related film data
    data_files = [
        ("genre", ["film_id", "film_genre"]),
        (
            "mrktg",
            [
                "film_id",
                "trailer_url",
                "poster_url",
                "nat_synopsis",
                "eng_synopsis",
            ],
        ),
        ("nat", ["film_id", "film_country", "prod_share"]),
        ("themes_plots_tags", ["film_id", "tag_name"]),
    ]

    for suffix, columns in data_files:
        df = load_data(RAW_DIR / f"{FILE_PREFIX}-{suffix}.csv")
        main_df = main_df.merge(df[columns], on="film_id", how="left")

    # Create nested media object
    main_df["media"] = main_df.apply(
        lambda x: {"trailerUrl": x["trailer_url"], "posterUrl": x["poster_url"]},
        axis=1,
    )
    main_df = main_df.drop(columns=["trailer_url", "poster_url"])

    # Create nested synopsis object
    main_df["synopsis"] = main_df.apply(
        lambda x: {"native": x["nat_synopsis"], "english": x["eng_synopsis"]},
        axis=1,
    )
    main_df = main_df.drop(columns=["nat_synopsis", "eng_synopsis"])

    # Create nested production object
    main_df["production"] = main_df.apply(
        lambda x: {"country": x["film_country"], "share": x["prod_share"]}, axis=1
    )
    main_df = main_df.drop(columns=["film_country", "prod_share"])

    main_df = main_df.rename(
        columns={
            "film_id": "id",
            "film_genre": "genre",
            "film_type": "filmType",
            "tag_name": "tags",
        }
    )

    return main_df


def load_data(
    file_path: Union[str, Path],
    sep: str = ",",
    skiprows: int = 0,
    drop_empty_cols: bool = True,
) -> DataFrame:
    """Load data from a CSV file.

    Args:
        file_path: Path to the CSV file
        sep: Separator for the columns
        skiprows: Number of rows to skip
        drop_empty_cols: Should empty columns be dropped?

    Returns:
        DataFrame with the loaded data

    Raises:
        FileNotFoundError: If the input file doesn't exist
        pd.errors.EmptyDataError: If the file is empty
    """
    try:
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        df = pd.read_csv(file_path, sep=sep, on_bad_lines="skip", skiprows=skiprows)

        if df.empty:
            raise pd.errors.EmptyDataError(f"Empty file: {file_path}")

        df = df.drop_duplicates()

        if drop_empty_cols:
            df = df.dropna(axis=1, how="all")

        logger.info(f"{file_path.name} loaded with {len(df)} rows")

        return df
    except Exception as e:
        logger.error(f"Error loading {file_path}: {str(e)}")
        raise


def process_biographies() -> DataFrame:
    """Process biography and nationality data.

    Returns:
        The dataframe with the biography data merged
    """
    biog_df = load_data(RAW_DIR / f"{FILE_PREFIX}-biog.csv", drop_empty_cols=False)
    biog_nat_df = load_data(
        RAW_DIR / f"{FILE_PREFIX}-biognat.csv", drop_empty_cols=False
    )

    for _df in [biog_df, biog_nat_df]:
        _df["person_name"] = _df["person_name"].str.strip()
        _df["person_id"] = _df["person_name"]

    biog_df["birth_year"] = biog_df["birth_year"].fillna(0).astype(int)
    biog_df["death_year"] = biog_df["death_year"].fillna(0).astype(int)

    biog_df = biog_df.merge(
        biog_nat_df[["person_id", "person_nat"]], on="person_id", how="left"
    )
    biog_df["person_nat"] = biog_df["person_nat"].fillna("")
    biog_df["slug"] = biog_df["person_id"].apply(lambda x: slugify(x))

    return biog_df


def process_characters() -> DataFrame:
    """Process character data.

    Returns:
        The dataframe with the character data merged
    """
    character_tags_df = load_data(RAW_DIR / f"{FILE_PREFIX}-character_tags.csv")

    character_tags_df["person_id"] = character_tags_df["person_id"].str.strip()
    character_tags_df["character_id"] = character_tags_df["character_id"].str.strip()

    biog_df = process_biographies()

    role_df = load_data(RAW_DIR / f"{FILE_PREFIX}-role.csv")
    role_df["person_id"] = role_df["person_id"].fillna(
        role_df["person_name"].str.strip()
    )
    role_df["person_id"] = role_df["person_id"].str.strip()
    role_df["person_name"] = role_df["person_name"].str.strip()

    character_tags_df = character_tags_df.merge(
        biog_df[
            [
                "person_id",
                "person_name",
                "birth_year",
                "death_year",
                "gender",
                "person_nat",
            ]
        ],
        on="person_id",
        how="left",
    )

    # Log any missing character biography data
    missing_biogs = character_tags_df[character_tags_df["person_name"].isna()][
        "person_id"
    ].unique()
    if len(missing_biogs) > 0:
        logger.warning(f"Missing biography data for character IDs: {missing_biogs}")

    character_tags_df = character_tags_df.merge(
        role_df[["film_id", "person_id", "role_class"]],
        on=["film_id", "person_id"],
        how="left",
    )

    character_tags_df["character_obj"] = character_tags_df.apply(
        lambda x: {
            "id": x["character_id"],
            "age": x["ch_age"],
            "gender": x["ch_gender"],
            "sexuality": x["ch_sexuality"],
            "origin": x["ch_porigin"],
            "class": x["ch_class"],
            "profession": x["ch_profession"],
            "ability": x["ch_ability"],
            "assistedMobility": x["ch_ability"],
            "person": {
                "id": x["person_id"],
                "name": x["person_name"],
                "birthYear": x["birth_year"],
                "deathYear": x["death_year"],
                "gender": x["gender"],
                "nationality": x["person_nat"],
            },
            "role": x["role_class"],
        },
        axis=1,
    )

    return character_tags_df


def aggregate_films_data(df: DataFrame) -> DataFrame:
    """Aggregate data by film ID, creating nested structures for related data."""
    dict_columns = ["character", "director"]

    for column in dict_columns:
        df[column] = df[column].apply(lambda x: json.dumps(x))

    grouped = df.groupby("id")

    result = grouped.agg(
        {
            "type": "first",
            "slug": "first",
            "title": "first",
            "filmType": "first",
            "release": "first",
            "production": "first",
            "media": "first",
            "genre": lambda x: list(set(x.dropna().unique())),
            "tags": lambda x: list(set(x.dropna().unique())),
            "director": lambda x: list(set(x.dropna().unique())),
            "character": lambda x: list(set(x.dropna().unique())),
            "synopsis": "first",
        }
    ).reset_index()

    for column in dict_columns:
        result[column] = result[column].apply(
            lambda x: [
                json.loads(item)
                for item in x
                if item and item != "null" and not pd.isna(item)
            ]
            if isinstance(x, list)
            else []
        )
        result[column] = result[column].apply(
            lambda x: [item for item in x if not pd.isna(item)]
        )

    return result


def save_data(df: DataFrame, name: str, individual: bool = False) -> None:
    """Save DataFrame to CSV and JSON formats."""
    try:
        INTERIM_DIR.mkdir(parents=True, exist_ok=True)
        FINAL_DIR.mkdir(parents=True, exist_ok=True)

        csv_path = INTERIM_DIR / f"{name}.csv"
        df.to_csv(csv_path, index=False, sep=",", encoding="utf-8")
        logger.info(f"Saved CSV to {csv_path}")

        json_path = FINAL_DIR / f"{name}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            for _, row in df.iterrows():
                row_dict = row.dropna().to_dict()
                json.dump(row_dict, f, indent=2, default=str)
                f.write("\n")
        logger.info(f"Saved JSON to {json_path}")

        if individual:
            individual_dir = FINAL_DIR / f"{name}"
            individual_dir.mkdir(exist_ok=True)

            for _, row in df.iterrows():
                file_path = individual_dir / f"{row['slug']}.json"
                row.to_json(file_path, indent=2)

            logger.info(f"Saved {len(df)} individual JSON files to {individual_dir}")
    except Exception as e:
        logger.error(f"Error saving {name} data: {str(e)}")
        raise


def combine_bio_data() -> DataFrame:
    """Combine all the biographies data from the raw files into a single dataframe."""
    try:
        biog_df = process_biographies()
        character_tags_df = process_characters()

        main_df = process_main()
        main_df = main_df.merge(
            character_tags_df[
                ["film_id", "character_id", "person_id", "character_obj"]
            ],
            left_on="id",
            right_on="film_id",
            how="left",
        )
        main_df = main_df.rename(columns={"character_obj": "character"})
        main_df = main_df.drop(columns=["film_id", "character_id"])
        main_df["character"] = main_df.apply(
            lambda x: replace_person_with_film(x), axis=1
        )

        biog_df = biog_df.merge(
            main_df[["person_id", "character"]],
            on="person_id",
            how="left",
        )

        main_df = process_main()
        main_df["directed"] = main_df.apply(
            lambda x: {
                "id": x["id"],
                "slug": x["slug"],
                "title": x["title"],
                "filmType": x["filmType"],
                "genre": x["genre"],
                "release": {
                    "type": x["release"]["type"],
                    "year": x["release"]["year"],
                },
                "tags": x["tags"],
                "production": x["production"],
            },
            axis=1,
        )

        biog_df = biog_df.merge(
            main_df[["director", "directed"]],
            left_on="person_id",
            right_on="director",
            how="left",
        )
        biog_df = biog_df.drop(columns=["director"])

        biog_df["type"] = "person"
        biog_df = biog_df.rename(
            columns={
                "person_id": "id",
                "person_name": "name",
                "birth_year": "birthYear",
                "death_year": "deathYear",
                "person_nat": "nationality",
                "directed": "director",
            }
        )

        return biog_df
    except Exception as e:
        logger.error(f"Error combining biographical data: {str(e)}")
        raise


def replace_person_with_film(row: dict) -> dict:
    """Replace the person object with the film object."""
    if pd.isna(row["character"]):
        return {}

    row["character"].pop("person", None)
    row["character"]["film"] = {
        "id": row["id"],
        "slug": row["slug"],
        "title": row["title"],
        "filmType": row["filmType"],
        "genre": row["genre"],
        "release": {
            "type": row["release"]["type"],
            "year": row["release"]["year"],
        },
        "tags": row["tags"],
        "production": row["production"],
    }

    return row["character"]


def aggregate_bio_data(df: DataFrame) -> DataFrame:
    """Aggregate data by person ID, creating nested structures for related data."""
    dict_columns = ["character", "director"]

    for column in dict_columns:
        df[column] = df[column].apply(lambda x: json.dumps(x))

    grouped = df.groupby("id")

    result = grouped.agg(
        {
            "type": "first",
            "slug": "first",
            "name": "first",
            "birthYear": "first",
            "deathYear": "first",
            "nationality": "first",
            "gender": "first",
            "character": lambda x: list(set(x.dropna().unique())),
            "director": lambda x: list(set(x.dropna().unique())),
        }
    ).reset_index()

    for column in dict_columns:
        result[column] = result[column].apply(
            lambda x: [
                json.loads(item)
                for item in x
                if item and item != "null" and not pd.isna(item)
            ]
            if isinstance(x, list)
            else []
        )
        result[column] = result[column].apply(
            lambda x: [item for item in x if not pd.isna(item)]
        )

    return result


if __name__ == "__main__":
    main()
