## v0.2.0 (2025-04-22)

### Feat

- **biographies**: Add biography detail page
- **films**: Add entries generator to support static build
- **types**: Add slug property to Item interface
- **films**: Add film detail page
- **data**: Add getData function to read JSON files based on slug
- **search**: Add links to page with item detail
- **frontend**: Add additional metadata to config
- **etl**: Add slug generation for films and biographies data
- **etl**: Split and explode director names in data processing
- **frontend**: Update header to use full title and enhance styling
- **frontend**: Add project full title to config
- **app.css**: Add League Gothic font
- **frontend**: Add frontend application

### Fix

- **styles**: Update font import path for League Gothic
- **frontend**: Delay search worker termination to prevent potential race conditions
- **frontend**: Add ARIA labels to navigation elements for accessibility
- **etl**: Trim whitespace from English titles

### Refactor

- **api**: Add extention to API routes to prevent route conflicts on build
- **search**: Update search worker to accept base path in load action
- **home**: Update header title and adjust font styles
- **layout**: Update layout to use siteName and add SEO metadata
- **mdsvex**: Update page title to use siteName config
- **api**: Change API route for dynamic slug handling

## v0.1.0 (2025-04-17)

### Feat

- **etl**: Add ETL pipeline package
