import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Union

import pandas as pd
from pandas import DataFrame
from slugify import slugify

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

FILE_PREFIX: str = "TheBeast2018-2023_20250305"
DATA_DIR: Path = Path("../data")
RAW_DIR: Path = DATA_DIR / "0_raw"
INTERIM_DIR: Path = DATA_DIR / "1_interim"
FINAL_DIR: Path = DATA_DIR / "2_final"


def main() -> None:
    try:
        films = process_films()

        with open(INTERIM_DIR / "films.json", "w") as f:
            json.dump(films, f, indent=4)

        people = process_people()

        with open(INTERIM_DIR / "biographies.json", "w") as f:
            json.dump(people, f, indent=4)

        films_with_cross_refs, people_with_cross_refs = augment_data(films, people)

        with open(FINAL_DIR / "films.json", "w") as f:
            json.dump(films_with_cross_refs, f, indent=4)

        (FINAL_DIR / "films").mkdir(parents=True, exist_ok=True)

        for film in films_with_cross_refs:
            with open(FINAL_DIR / "films" / f"{film['slug']}.json", "w") as f:
                json.dump(film, f, indent=4)

        with open(FINAL_DIR / "biographies.json", "w") as f:
            json.dump(people_with_cross_refs, f, indent=4)

        (FINAL_DIR / "biographies").mkdir(parents=True, exist_ok=True)

        for person in people_with_cross_refs:
            with open(FINAL_DIR / "biographies" / f"{person['slug']}.json", "w") as f:
                json.dump(person, f, indent=4)

        corpus = films_with_cross_refs + people_with_cross_refs

        with open(FINAL_DIR / "corpus.json", "w") as f:
            json.dump(corpus, f, indent=4)
    except Exception as e:
        logger.error(f"Error processing biographical data: {str(e)}")
        raise


def process_films() -> dict:
    """Process films data.

    Returns:
        A list of films
    """
    characters_df = process_characters_df()

    genre_df = load_data(RAW_DIR / f"{FILE_PREFIX}-genre.csv")
    genre_df["film_genre"] = genre_df.apply(
        lambda x: expand_code("genre", x["film_genre"]), axis=1
    )

    mrktg_df = load_data(RAW_DIR / f"{FILE_PREFIX}-mrktg.csv")
    for col in ["trailer_url", "poster_url", "nat_synopsis", "eng_synopsis"]:
        mrktg_df[col] = mrktg_df[col].fillna("")

    nat_df = load_data(RAW_DIR / f"{FILE_PREFIX}-nat.csv")
    nat_df["film_country"] = nat_df.apply(
        lambda x: expand_code("country", x["film_country"]), axis=1
    )
    nat_df["prod_share"] = nat_df.apply(
        lambda x: expand_code("prod_share", x["prod_share"]), axis=1
    )

    roles_df = load_data(RAW_DIR / f"{FILE_PREFIX}-role.csv")
    roles_df["person_id"] = roles_df["person_name"].str.strip()
    roles_df["role_class"] = roles_df.apply(
        lambda x: expand_code("role_class", x["role_class"]), axis=1
    )

    themes_df = load_data(RAW_DIR / f"{FILE_PREFIX}-themes_plots_tags.csv")

    main_df = process_main_df()

    films = {}
    for _, row in main_df.iterrows():
        film_id = row["id"]

        characters = characters_df[characters_df["film_id"] == film_id][
            "character_obj"
        ].values.tolist()

        production = nat_df[nat_df["film_id"] == film_id][
            ["film_country", "prod_share"]
        ].values.tolist()

        roles = roles_df[roles_df["film_id"] == film_id][
            ["person_id", "role_class"]
        ].values.tolist()

        tags = themes_df[themes_df["film_id"] == film_id]["tag_name"]
        if tags.empty:
            tags = []
        else:
            tags = [tag for tag in tags.values.tolist() if not pd.isna(tag)]

        films[film_id] = {
            "type": "Film",
            "id": film_id,
            "slug": row["slug"],
            "title": {
                "native": row["nat_title"],
                "english": row["eng_title"],
            },
            "release": row["release"],
            "filmType": row["filmType"],
            "directors": row["director"],
            "genre": genre_df[genre_df["film_id"] == film_id]["film_genre"].tolist(),
            "media": {
                "posterUrl": get_single_value(
                    mrktg_df, "film_id", film_id, "poster_url"
                ),
                "trailerUrl": get_single_value(
                    mrktg_df, "film_id", film_id, "trailer_url"
                ),
            },
            "synopsis": {
                "native": get_single_value(
                    mrktg_df, "film_id", film_id, "nat_synopsis"
                ),
                "english": get_single_value(
                    mrktg_df, "film_id", film_id, "eng_synopsis"
                ),
            },
            "production": [
                {
                    "country": country,
                    "share": share,
                }
                for country, share in production
            ],
            "characters": characters,
            "roles": [
                {
                    "person": person,
                    "role": role,
                }
                for person, role in sorted(roles, key=lambda x: x[0])
            ],
            "tags": tags,
        }

    return films


def process_characters_df() -> DataFrame:
    """Process character data.

    Returns:
        The dataframe with the character data merged
    """
    character_tags_df = load_data(RAW_DIR / f"{FILE_PREFIX}-character_tags.csv")

    character_tags_df["person_id"] = character_tags_df["person_id"].fillna("")
    character_tags_df["person_id"] = character_tags_df["person_id"].str.strip()
    character_tags_df["character_id"] = character_tags_df["character_id"].fillna("")
    character_tags_df["character_id"] = character_tags_df["character_id"].str.strip()
    character_tags_df["ch_age"] = character_tags_df["ch_age"].apply(
        lambda x: int(x) if x in ["1", "2", "3", "4", "5"] else 5
    )

    character_tags_df["character_obj"] = character_tags_df.apply(
        lambda x: {
            "id": x["character_id"],
            "film": x["film_id"],
            "person": x["person_id"],
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
        },
        axis=1,
    )

    return character_tags_df


def process_main_df() -> DataFrame:
    """Process main data.

    Returns:
        A dataframe with the main data
    """
    main_df = load_data(
        RAW_DIR / "The-Beast-2018-2023-main-v4.csv", sep=";", skiprows=1
    )

    main_df["type"] = "Film"
    main_df["eng_title"] = main_df["eng_title"].fillna("")

    main_df["slug"] = main_df.apply(
        lambda x: slugify(f"{x['film_id']}-{x['nat_title']}"), axis=1
    )

    main_df["release_date"] = pd.to_datetime(
        main_df["release_date"], errors="coerce", format="mixed", cache=True
    )
    main_df["release_year"] = main_df["release_date"].dt.year
    main_df["release_year"] = main_df["release_year"].fillna(0).astype(int)
    main_df["release_type"] = main_df["release_type"].apply(
        lambda x: expand_code("release_type", x)
    )
    main_df["release"] = main_df.apply(
        lambda x: {
            "type": x["release_type"],
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

    main_df = main_df.rename(columns={"film_id": "id", "tag_name": "tags"})
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


def get_single_value(df: DataFrame, id_column: str, id_value: str, column: str) -> str:
    """Get the single value from a dataframe for an id."""
    try:
        return df[df[id_column] == id_value][column].values[0]
    except Exception:
        return ""


def process_people() -> dict:
    """Process people data.

    Returns:
        A list of people
    """
    biog_df = process_biographies_df()

    characters_df = process_characters_df()

    roles_df = load_data(RAW_DIR / f"{FILE_PREFIX}-role.csv")
    roles_df["person_id"] = roles_df["person_name"].str.strip()
    roles_df["role_class"] = roles_df.apply(
        lambda x: expand_code("role_class", x["role_class"]), axis=1
    )

    people = {}
    for _, row in biog_df.iterrows():
        characters = characters_df[characters_df["person_id"] == row["person_id"]][
            "character_obj"
        ].values.tolist()

        roles = roles_df[roles_df["person_id"] == row["person_id"]][
            ["film_id", "role_class"]
        ].values.tolist()

        people[row["person_id"]] = {
            "type": "Person",
            "id": row["person_id"],
            "slug": row["slug"],
            "name": row["person_name"],
            "birthYear": row["birth_year"],
            "deathYear": row["death_year"],
            "gender": row["gender"],
            "nationality": row["person_nat"],
            "characters": characters,
            "roles": [
                {
                    "film": film,
                    "role": role,
                }
                for film, role in sorted(roles, key=lambda x: x[0])
            ],
        }

    return people


def process_biographies_df() -> DataFrame:
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


def augment_data(films: dict, people: dict) -> tuple[list[dict], list[dict]]:
    """Augment films and people data with cross-references.

    Returns:
        The films and people data with cross-references
    """
    films_with_cross_refs = []
    people_with_cross_refs = []

    for _, film in films.items():
        logger.debug(f"Processing film: {film.get('id')}")
        # Process directors
        if "directors" in film:
            film["directors"] = [
                get_person(people, {"person": director})["person"]
                for director in film["directors"]
            ]

        # Process characters
        if "characters" in film:
            film["characters"] = [
                get_person(people, character) for character in film["characters"]
            ]

        # Process roles
        if "roles" in film:
            film["roles"] = [get_person(people, role) for role in film["roles"]]

        films_with_cross_refs.append(film)

    for _, person in people.items():
        logger.debug(f"Processing person: {person.get('id')}")
        # Process characters
        if "characters" in person:
            person["characters"] = [
                get_film(films, character) for character in person["characters"]
            ]

        # Process roles
        if "roles" in person:
            person["roles"] = [get_film(films, role) for role in person["roles"]]

        people_with_cross_refs.append(person)

    return films_with_cross_refs, people_with_cross_refs


def get_person(people: dict, obj: dict) -> dict:
    """Get person data from the people dictionary.

    Returns:
        The person data without nested objects
    """
    logger.debug(f"Looking up person with key: {obj.get('person')}")

    person = people.get(obj["person"])

    if person:
        person_copy = person.copy()

        if "type" in person_copy:
            del person_copy["type"]
        if "characters" in person_copy:
            del person_copy["characters"]
        if "roles" in person_copy:
            del person_copy["roles"]

        obj["person"] = person_copy

    return obj


def get_film(films: dict, obj: dict) -> dict:
    """Get film data from the films dictionary.

    Returns:
        The film data without nested objects
    """
    logger.debug(f"Looking up film with key: {obj.get('film')}")

    film = films.get(obj["film"])

    if film:
        film_copy = film.copy()

        for key in [
            "type",
            "characters",
            "directors",
            "filmType",
            "genre",
            "media",
            "roles",
            "synopsis",
            "tags",
        ]:
            if key in film_copy:
                del film_copy[key]

        obj["film"] = film_copy

    return obj


if __name__ == "__main__":
    main()
