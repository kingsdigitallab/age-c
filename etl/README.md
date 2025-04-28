# ETL package for the AGE-C project

This package contains the code for the ETL pipeline for the AGE-C project. It is
used to extract the data from multiple CSV files and combine them into a single
JSON file suitable to be used by the
[itemsjs](https://github.com/itemsapi/itemsjs) search engine.

## Getting started

Install the [uv](https://docs.astral.sh/uv/getting-started/installation/)
package manager.

### Running the ETL process

```bash
uv run main.py
```

This will aggregate the data from the CSV files and save the results in two
formats, CSV and JSON. The CSV data is stored in the `data/1_interim` folder and
the JSON data is stored in the `data/2_final` folder.

The JSON data is then used by the frontend application to display and explore
the data.

## Data model

```mermaid
erDiagram
    Film }o--o{ Genre : categorised_as
    Film {
        string film_id
        string nat_title
        string eng_title
        string director
        string release_type
        string release_date
        string film_type
    }
    Genre {
        string film_id
        string nat_title
        string film_genre
    }
    Film ||--|| Marketing : promoted_by
    Marketing {
        string film_id
        string nat_title
        string eng_title
        string trailer_url
        string poster_url
        string nat_synopsis
        string eng_synopsis
    }
    Film ||--|| Production : produced_by
    Production {
        string film_id
        string nat_title
        string film_country
        string prod_share
    }
    Film ||--o{ Role : cast_with
    Role {
        string film_id
        string nat_title
        string person_id
        string person_name
        string role_class
    }
    Film }o--o{ Tag : tagged_with
    Tag {
        string film_id
        string nat_title
        string tag_id
        string tag_name
    }
    Film ||--o{ Character : contains
    Character {
        string film_id
        string nat_title
        string character_id
        string person_id
        string ch_age
        string ch_gender
        string ch_sexuality
        string ch_porigin
        string ch_class
        string ch_profession
        string ch_ability
        string assisted_mobility
    }
    Character ||--|| Biography : played_by
    Biography {
        string person_id
        string person_name
        string birth_year
        string death_year
        string gender
        string sexuality
    }
    Role }o--|| Biography : acted_by
    Role {
        string film_id
        string nat_title
        string person_id
        string person_name
        string role_class
    }
    Biography ||--o{ Country : nationality
    Country {
        string person_id
        string person_name
        string person_nationality
    }
    Production ||--|{ Country : produced_in
```

## Data processing pipeline

The following diagram shows the data processing pipeline for the AGE-C project.

```mermaid
flowchart TD
    A[Raw Data Files]

    B[Combine Data]
    C[Normalise Columns]

    D1[Aggregate Data by Film]
    D2[Aggregate Data by Person]

    E1[/data/1_interim/films.csv/]
    E2[/data/2_final/films.json/]
    E3[/data/1_interim/biographies.csv/]
    E4[/data/2_final/biographies.json/]

    A --> B
    B --> C
    C --> D1
    C --> D2
    D1 --> E1
    D1 --> E2
    D2 --> E3
    D2 --> E4
```
