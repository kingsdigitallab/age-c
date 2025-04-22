# About the data

This dataset contains information about European films and their distribution
from 2018 to 2023. The data is organised across multiple CSV files:

1. `main.csv`: Core film information including IDs, titles (in original language
   and English), directors, release dates, and film types
1. `biog.csv`: Biographical information about cast and crew
1. `biognat.csv`: Biographical and nationality data
1. `character_tags.csv`: Character-related tags
1. `genre.csv`: Film genres
1. `mrktg.csv`: Marketing-related data (synopsis, posters, trailers)
1. `nat.csv`: Nationality-related information and production shares
1. `role.csv`: Cast and crew roles
1. `themes_plots_tags.csv`: Film themes, plot elements, and tags

## Directory Structure

The data is organised into three tiers:

1. `0_raw/`: The original data from the source

   - Original CSV files with no modifications
   - Preserves source data integrity

1. `1_interim/`: The data after initial cleaning

   - Standardised formats
   - Cleaned and validated data
   - Combined datasets

1. `2_final/`: The final data after further cleaning and processing

   - JSON collections of films/biographies
   - Individual JSON files for each film/biography
   - Ready for analysis and application use

## Technical Details

- File Format: CSV
  - **NOTE**: `main.csv` uses semicolon (;) as the separator
- Date Range: 1905-2023 (primarily focused on 2018-2023)
- File Sizes: 150KB to 3.2MB
- Output Formats: CSV, JSON

## Data Quality Notes

### Known Issues

- Missing Data:
  - Person IDs are empty, currently being filled with the person's name, because
    that is what is being used to identify the person in some cases
  - English titles may be missing for some films
  - Incomplete biographical information in some cases

### Format Inconsistencies

- Date formats vary across the dataset:
  - MM/DD/YYYY
  - DD.MM.YY
  - Other variations may exist

### Technical Limitations

- Poster URLs link to media viewer rather than direct image files
