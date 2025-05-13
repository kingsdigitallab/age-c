import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Dict, Union

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
        films_df = films_df.fillna("")
        logger.info(f"Aggregated films dataframe with {len(films_df)} rows")
        save_data(films_df, "films", individual=True)

        biog_df = combine_bio_data()
        biog_df = aggregate_bio_data(biog_df)
        biog_df = biog_df.fillna("")
        logger.info(f"Aggregated biographies dataframe with {len(biog_df)} rows")
        save_data(biog_df, "biographies", individual=True)

        corpus_df = pd.concat([films_df, biog_df], ignore_index=True)
        corpus_df = corpus_df.fillna("")
        logger.info(f"Concatenated dataframe with {len(corpus_df)} rows")
        save_data(corpus_df, "corpus", individual=False)
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise


def combine_films_data() -> DataFrame:
    """Combine all the films data from the raw files into a single dataframe."""
    try:
        main_df = process_main()

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
        director_df = director_df.fillna("")

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

    main_df["type"] = "Film"
    main_df["slug"] = main_df.apply(
        lambda x: slugify(f"{x['film_id']}-{x['nat_title']}"), axis=1
    )

    main_df["eng_title"] = main_df["eng_title"].fillna("")
    main_df["title"] = main_df.apply(
        lambda x: {
            "native": x["nat_title"].strip(),
            "english": x["eng_title"].strip(),
        },
        axis=1,
    )
    main_df = main_df.drop(columns=["nat_title", "eng_title"])

    main_df["release_date"] = pd.to_datetime(
        main_df["release_date"], errors="coerce", format="mixed", cache=True
    )
    main_df["release_year"] = main_df["release_date"].dt.year
    main_df["release_year"] = main_df["release_year"].fillna(0).astype(int)
    main_df["release"] = main_df.apply(
        lambda x: {
            "type": expand_code("release_type", x["release_type"]),
            "date": x["release_date"].strftime("%Y-%m-%d")
            if pd.notnull(x["release_date"])
            else None,
            "year": x["release_year"],
        },
        axis=1,
    )
    main_df = main_df.drop(columns=["release_type", "release_date", "release_year"])

    main_df["filmType"] = main_df["film_type"].apply(
        lambda x: expand_code("film_type", x)
    )
    main_df = main_df.drop(columns=["film_type"])

    main_df["director"] = main_df["director"].str.split(", ")
    main_df = main_df.explode("director")
    main_df["director"] = main_df["director"].str.strip()

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
        main_df = main_df.fillna("")

    main_df["genre"] = main_df["film_genre"].apply(lambda x: expand_code("genre", x))
    main_df = main_df.drop(columns=["film_genre"])
    main_df["media"] = main_df.apply(
        lambda x: {"trailerUrl": x["trailer_url"], "posterUrl": x["poster_url"]},
        axis=1,
    )
    main_df = main_df.drop(columns=["trailer_url", "poster_url"])

    main_df["synopsis"] = main_df.apply(
        lambda x: {"native": x["nat_synopsis"], "english": x["eng_synopsis"]},
        axis=1,
    )
    main_df = main_df.drop(columns=["nat_synopsis", "eng_synopsis"])

    main_df["production"] = main_df.apply(
        lambda x: {
            "country": expand_code("country", x["film_country"]),
            "share": expand_code("prod_share", x["prod_share"]),
        },
        axis=1,
    )
    main_df = main_df.drop(columns=["film_country", "prod_share"])

    main_df = main_df.rename(
        columns={
            "film_id": "id",
            "tag_name": "tags",
        }
    )
    main_df = main_df.fillna("")

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


@lru_cache(maxsize=1024)
def expand_code(field: str, code: str) -> str:
    """Expand an abbreviation code into a full description."""
    default = "Unknown"

    if pd.isna(code) or code == "":
        return default

    df = load_data(RAW_DIR / f"codes/{field}.csv")
    types = df[df["Code"] == code]["Description"]

    if len(types) == 0:
        return default

    return types.values[0]


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
    biog_df["gender"] = biog_df["gender"].apply(lambda x: expand_code("gender", x))

    biog_df = biog_df.merge(
        biog_nat_df[["person_id", "person_nat"]], on="person_id", how="left"
    )
    biog_df["person_nat"] = biog_df["person_nat"].apply(
        lambda x: expand_code("country", x)
    )
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
    character_tags_df["ch_age"] = character_tags_df["ch_age"].apply(
        lambda x: int(x) if x in ["1", "2", "3", "4", "5"] else 5
    )

    biog_df = process_biographies()

    role_df = load_data(RAW_DIR / f"{FILE_PREFIX}-role.csv")
    role_df["person_id"] = role_df["person_name"]
    role_df["person_id"] = role_df["person_id"].str.strip()
    role_df["person_name"] = role_df["person_name"].str.strip()

    character_tags_df = character_tags_df.merge(
        biog_df[
            [
                "person_id",
                "slug",
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
    character_tags_df = character_tags_df.fillna("")

    character_tags_df["character_obj"] = character_tags_df.apply(
        lambda x: {
            "id": x["character_id"],
            "age": f"{x['ch_age']}: {expand_code('age', x['ch_age'])}",
            "gender": expand_code("gender", x["ch_gender"]),
            "sexuality": expand_code("sexuality", x["ch_sexuality"]),
            "origin": expand_code("origin", x["ch_porigin"]),
            "class": expand_code("class", x["ch_class"]),
            "profession": expand_code("professional_status", x["ch_profession"]),
            "ability": expand_code("ability", x["ch_ability"]),
            "assistedMobility": expand_code(
                "assisted_mobility", x["assisted_mobility"]
            ),
            "person": {
                "id": x["person_id"],
                "slug": x["slug"],
                "name": x["person_name"],
                "birthYear": x["birth_year"],
                "deathYear": x["death_year"],
                "gender": x["gender"],
                "nationality": x["person_nat"],
            },
            "role": expand_code("role_class", x["role_class"]),
        },
        axis=1,
    )

    return character_tags_df


def aggregate_films_data(df: DataFrame) -> DataFrame:
    """Aggregate data by film ID, creating nested structures for related data."""
    dict_columns = [
        "character",
        "director",
        "media",
        "production",
        "release",
        "synopsis",
        "tags",
        "title",
    ]

    for column in dict_columns:
        df[column] = df[column].apply(lambda x: json.dumps(x))

    df = df.drop_duplicates()

    grouped = df.groupby("id")

    result = grouped.agg(
        {
            "type": "first",
            "slug": "first",
            "title": "first",
            "filmType": "first",
            "release": "first",
            "production": lambda x: list(set(x.dropna().unique())),
            "media": "first",
            "genre": lambda x: list(set(x.dropna().unique())),
            "tags": lambda x: list(set(x.dropna().unique())),
            "director": lambda x: list(set(x.dropna().unique())),
            "character": lambda x: list(set(x.dropna().unique())),
            "synopsis": "first",
        }
    ).reset_index()

    for column in dict_columns:
        if column in ["character", "director", "genre", "production", "tags"]:
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
        else:
            result[column] = result[column].apply(json.loads)

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

        records = df.to_dict("records")
        records = [clean_deep(record) for record in records]
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, default=str)

        logger.info(f"Saved JSON to {json_path}")

        if individual:
            individual_dir = FINAL_DIR / f"{name}"
            individual_dir.mkdir(exist_ok=True)

            for _, row in df.iterrows():
                record = clean_deep(row.to_dict())
                file_path = individual_dir / f"{row['slug']}.json"
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(record, f, indent=2, default=str)

            logger.info(f"Saved {len(df)} individual JSON files to {individual_dir}")
    except Exception as e:
        logger.error(f"Error saving {name} data: {str(e)}")
        raise


def clean_deep(data: Union[Dict, list]) -> Union[Dict, list]:
    """Remove empty values from nested dictionaries and lists.

    Empty values are:
    - None
    - Empty strings
    - Empty lists
    - Empty dictionaries
    - 0 for numbers

    Args:
        data: Dictionary or list to clean

    Returns:
        Cleaned dictionary or list with empty values removed
    """
    if isinstance(data, list):
        return [
            clean_deep(item) for item in data if item not in (None, 0, 0.0, "", [], {})
        ]

    if isinstance(data, dict):
        cleaned = {}

        for key, value in data.items():
            if isinstance(value, (dict, list)):
                cleaned_value = clean_deep(value)
                if cleaned_value not in (None, 0, 0.0, "", [], {}):
                    cleaned[key] = cleaned_value
            elif value not in (None, 0, 0.0, "", [], {}):
                cleaned[key] = value

        return cleaned

    return data


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

        biog_df["type"] = "Biography"
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
        df[column] = df[column].apply(lambda x: json.dumps(x, sort_keys=True))

    df = df.drop_duplicates()

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
            lambda x: [
                item
                for item in x
                if (isinstance(item, list) and len(item) > 0) or not pd.isna(item)
            ]
        )

    def unique_list(x):
        if len(x) == 0:
            return None

        unique_ids = []
        unique_values = []

        for item in x:
            if item["id"] not in unique_ids:
                unique_ids.append(item["id"])
                unique_values.append(item)

        return unique_values

    for column in dict_columns:
        result[column] = result[column].apply(unique_list)

    return result


if __name__ == "__main__":
    main()
