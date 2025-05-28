import marimo

__generated_with = "0.13.13"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(mo):
    mo.md(
        r"""
    # Comedies in Italy with Female Actors in a Supporting Role

    One of the partners identified an issue with not enough results being returned when doing the following search in the frontend: 

    * Genre: Comedies
    * Country: Produced by Italy
    * Person Gender: With female-identifying
    * Role: Supporting characters

    It yielded **two** results in which the UK is main producer and Italy minor producer.

    This notebook explores the raw data to investigate if there is a problem in the data aggregation.
    """
    )
    return


@app.cell
def _():
    import pandas as pd
    return (pd,)


@app.cell
def _(mo):
    mo.md(
        r"""
    ## Load the film data
    And filter by Italy and Comedy.
    """
    )
    return


@app.cell
def _(pd):
    production_df = pd.read_csv('../data/0_raw/TheBeast2018-2023_20250305-nat.csv')
    genre_df = pd.read_csv('../data/0_raw/TheBeast2018-2023_20250305-genre.csv')

    italy_df = production_df[production_df['film_country'] == 'IT']
    italy_df = italy_df.merge(genre_df, on="film_id")

    italian_comedies_df = italy_df[italy_df['film_genre'] == 'COM']
    italian_comedies_df.head()
    return (italian_comedies_df,)


@app.cell
def _(italian_comedies_df, mo):
    mo.md(f"""There are **{italian_comedies_df.size}** *Comedy* films produced *Italy*.""")
    return


@app.cell
def _(mo):
    mo.md(
        r"""
    ## Load the person data
    And filter by gender F and SUP roles.
    """
    )
    return


@app.cell
def _(mo, pd):
    biog_df = pd.read_csv('../data/0_raw/TheBeast2018-2023_20250305-biog.csv')
    biog_df = biog_df.drop(columns='person_id')
    roles_df = pd.read_csv('../data/0_raw/TheBeast2018-2023_20250305-role.csv')
    roles_df = roles_df.drop(columns='person_id')

    person_df = biog_df.merge(roles_df, on="person_name")
    person_df = person_df[person_df['gender'] == 'F']
    person_df = person_df[person_df['role_class'] == 'SUP']
    person_df.head()

    mo.md(f"There are **{person_df.size}** persons with gender *Female* and role *Supporting Actor*.")
    return (person_df,)


@app.cell
def _(mo):
    mo.md(r"""## Merge the person data with the Italian Comedy films""")
    return


@app.cell
def _(italian_comedies_df, mo, person_df):
    final_df = italian_comedies_df.merge(person_df, on='film_id')
    number_of_films = final_df['film_id'].unique().size

    mo.md(f"There are **{number_of_films}** *Comedies* in *Italy* with *Female* actors with role *Supporting Actor*.")
    return


if __name__ == "__main__":
    app.run()
