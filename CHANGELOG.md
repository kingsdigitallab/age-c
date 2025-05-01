## v0.3.0 (2025-05-01)

### Feat

- **landing**: Add site description and about link
- **search**: Add SearchPagination into Search component and manage pagination state
- **search**: Add SearchPagination component
- **search**: Add optional page parameter to SearchParams
- **search**: Add custom start index for ordered lists in SearchResultsItems
- **search**: Pass calculated start index to SearchResultsItems
- **search**: Add pagination support to search function
- **search**: Add optional start attribute to SearchResultsItems for custom ordered lists
- **search**: Enable prerendering and add entries generator for search API
- **home**: Pass custom SearchResultsItems component into Search
- **components**: Add component to display search results
- **data**: Enhance data processing and aggregation
- **routes**: Add explore search to home page
- **routes**: Add film and person detail pages
- **api**: Add new API route that returns data ready for search
- **data**: Add getDataForSearch function to  process and format data for search
- **search**: Modularise search components and add new features
- **etl**: Implement data cleaning for JSON output
- **etl**: Enhance data processing and aggregation for films and biographies
- **etl**: transform data into nested structures
- **components**: Add table components for displaying biographies and films
- **explore**: Create Explore page with data source selection for films and biographies
- **layout**: Add 'Explore' link to navigation menu

### Fix

- **search**: Reset search page to 1 on search, reset, and filter change actions
- **types**: Add 'slug' property to Person interface
- **index**: Remove nested list from search fields configuration
- **search**: Update searchableFields type to string array in CorpusConfig
- **search**: Make 'title' prop optional in SearchResults component
- **search**: Make 'title' prop optional in SearchInput component
- **search**: Make 'children' prop optional in SearchFilters component
- **search**: Prevent default form submission event in search handler
- **search**: Update link url to use base path
- **api**: Remove unused import from server route file

### Refactor

- **routes**: Remove unused navigation links
- **routes**: Remove biographies and films routes
- **types**: Redefine and expand interfaces for film and related entities
- **index**: Refactor search configuration and aggregations
- **etl**: Remove commented-out code and clean up data processing functions
- **search**: Change results display to tabular format
- **biographies, films**: Replace list item  components with table components
- **layout**: Update colour theme to zinc

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
