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
