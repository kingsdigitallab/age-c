# AGE-C

Repository for the storage, transformation and presentation of data related to
the [AGE-C](https://age-c.eu/) project.

## Architecture

```mermaid
graph LR
    A[Source Data] --> B[ETL Package]

    subgraph ETL
        B --> C[Transformed Data]
    end

    C --> D[Frontend Application]

    subgraph Frontend Features
        D --> E[Faceted Search]
        D --> F[Data Visualisation]
    end
```

## ETL

The ETL package is a Python package that is used to transform the data from the
source data into the transformed data. For more information on how to use the
package, please refer to the [ETL README](etl/README.md).

## Frontend

The frontend is a SvelteKit application that is used to display the transformed
data. For more information on how to use the application, please refer to the
[Frontend README](frontend/README.md).
