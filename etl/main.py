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
        df = combine_data()
        df = normalise_columns(df)

        films_df = aggregate_data(df, "filmId")
        films_df["slug"] = films_df.apply(
            lambda x: slugify(f"{x['filmId']}-{x['title']}"), axis=1
        )
        logger.info(f"Aggregated films dataframe with {len(films_df)} rows")
        save_data(films_df, "films")

        biog_df = aggregate_data(df, "perId")
        biog_df["slug"] = biog_df["perId"].apply(slugify)
        logger.info(f"Aggregated biographies dataframe with {len(biog_df)} rows")
        save_data(biog_df, "biographies")
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise


def combine_data() -> DataFrame:
    """Combine all the data from the raw files into a single dataframe."""
    try:
        main_df = load_data(
            RAW_DIR / "The-Beast-2018-2023-main-v4.csv", sep=";", skiprows=1
        )

        main_df["director"] = main_df["director"].str.split(", ")
        main_df = main_df.explode("director")

        main_df["eng_title"] = main_df["eng_title"].str.strip()

        main_df["release_date"] = pd.to_datetime(
            main_df["release_date"], errors="coerce", format="mixed", cache=True
        )
        main_df["release_year"] = main_df["release_date"].dt.year

        director_df = process_biographies()
        director_df.columns = [
            "person_id",
            "director_name",
            "director_birth_year",
            "director_death_year",
            "director_gender",
            "director_nat",
        ]

        main_df = main_df.merge(
            director_df,
            left_on="director",
            right_on="person_id",
            how="left",
        )

        main_df = main_df.drop(columns=["person_id"])
        main_df = main_df.drop_duplicates()

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

        character_tags_df = load_data(RAW_DIR / f"{FILE_PREFIX}-character_tags.csv")
        main_df = main_df.merge(
            character_tags_df.drop(columns=["nat_title"]),
            on="film_id",
            how="left",
        )

        biog_df = process_biographies()
        main_df = main_df.merge(
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

        role_df = load_data(RAW_DIR / f"{FILE_PREFIX}-role.csv")
        role_df["person_role"] = role_df.apply(
            lambda x: f"{x['role_class']}:::{x['person_name']}", axis=1
        )
        main_df = main_df.merge(
            role_df[["film_id", "person_id", "person_role"]],
            on=["film_id", "person_id"],
            how="left",
        )

        for col in [
            "release_year",
            "director_birth_year",
            "director_death_year",
            "birth_year",
            "death_year",
        ]:
            main_df[col] = main_df[col].fillna(0).astype(int)

        return main_df.drop_duplicates()
    except Exception as e:
        logger.error(f"Error combining data: {str(e)}")
        raise


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
        _df["person_id"] = _df["person_id"].fillna(_df["person_name"])

    biog_df = biog_df.merge(
        biog_nat_df[["person_id", "person_nat"]], on="person_id", how="left"
    )

    return biog_df


def normalise_columns(df: DataFrame) -> DataFrame:
    """Normalise column names to a consistent format."""
    column_mapping = {
        "assisted_mobility": "assistedMobility",
        "birth_year": "perBirthYear",
        "ch_ability": "charAbility",
        "ch_age": "charAge",
        "ch_class": "charClass",
        "ch_gender": "charGender",
        "ch_porigin": "charOrigin",
        "ch_profession": "charProfession",
        "ch_sexuality": "charSexuality",
        "character_id": "charId",
        "death_year": "perDeathYear",
        "director_name": "directorName",
        "director_birth_year": "directorBirthYear",
        "director_death_year": "directorDeathYear",
        "director_gender": "directorGender",
        "director_nat": "directorNationality",
        "eng_synopsis": "synopsisEn",
        "eng_title": "titleEn",
        "film_country": "country",
        "film_genre": "genre",
        "film_id": "filmId",
        "film_type": "type",
        "gender": "perGender",
        "nat_synopsis": "synopsis",
        "nat_title": "title",
        "person_id": "perId",
        "person_name": "perName",
        "person_nat": "perNationality",
        "person_role": "perRole",
        "poster_url": "posterUrl",
        "prod_share": "productionShare",
        "release_date": "releaseDate",
        "release_year": "releaseYear",
        "release_type": "releaseType",
        "tag_name": "tags",
        "trailer_url": "trailerUrl",
    }

    return df.rename(
        columns={
            col: new_col for col, new_col in column_mapping.items() if col in df.columns
        }
    )


def aggregate_data(df: DataFrame, id_column: str) -> DataFrame:
    """Aggregate data by ID column, creating lists for columns with multiple values."""
    if id_column not in df.columns:
        raise ValueError(f"ID column '{id_column}' not found in DataFrame")

    columns = df.columns.tolist()
    columns.remove(id_column)

    return (
        df.groupby(id_column)
        .agg(
            {
                col: lambda x: list(set(x)) if len(set(x)) > 1 else x.iloc[0]
                for col in columns
            }
        )
        .reset_index()
    )


def save_data(df: DataFrame, name: str) -> None:
    """Save DataFrame to CSV and JSON formats."""
    try:
        INTERIM_DIR.mkdir(parents=True, exist_ok=True)
        FINAL_DIR.mkdir(parents=True, exist_ok=True)

        csv_path = INTERIM_DIR / f"{name}.csv"
        df.to_csv(csv_path, index=False, sep=",", encoding="utf-8")
        logger.info(f"Saved CSV to {csv_path}")

        json_path = FINAL_DIR / f"{name}.json"
        df.to_json(json_path, orient="records", indent=2)
        logger.info(f"Saved JSON to {json_path}")

        individual_dir = FINAL_DIR / f"{name}"
        individual_dir.mkdir(exist_ok=True)

        for _, row in df.iterrows():
            file_path = individual_dir / f"{row['slug']}.json"
            row.to_json(file_path, indent=2)

        logger.info(f"Saved {len(df)} individual JSON files to {individual_dir}")
    except Exception as e:
        logger.error(f"Error saving {name} data: {str(e)}")
        raise


if __name__ == "__main__":
    main()
