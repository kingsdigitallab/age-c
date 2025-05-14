# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.6.0 (2025-05-12)

### Feat

- **characterstable**: Add striped class to table
- **app.css**: Add inline class for comma separated flex layout
- **biography**: Enhance biography details page
- **characters**: Add CharactersTable component to display character details
- **film**: Add FilmLink component for linking to individual films
- **search**: Add sortBy prop to Search component
- **landing**: Set default sorting for search
- **film**: Expand film details page
- **search**: Initialise search filters from searchParams on component mount
- **search**: Refactor SearchResultsItems to use BiographyLink and DirectorLink to link to biographies
- **filter**: Add FilterLink component for dynamic filtering in the application
- **director**: Add DirectorLink component for linking to individual director biographies
- **biography**: Add BiographyLink component for linking to individual biographies

### Fix

- **film**: Ensure media section only renders when media array is not empty
- **search**: Prevent rendering distribution facets while loading
- **facetDistributionPlot**: Remove console logging
- **data**: Change getNestedField function to safely access nested properties
- **etl**: Update production column aggregation to handle multiple values
- **film**: Handle potential undefined values in character and director sorting
- **biography**: Handle potential undefined values in character sorting
- **biography**: Ensure BiographyLink only renders if slug is present

### Refactor

- **page**: Update distribution facets to support multiple categories including gender and character attributes
- **search**: Extend distribution facet handling to support multiple facets
- **facetDistributionPlot**: Improved data handling and axis configuration to support categorical distributions
- **layout**: Remove unused Pico colour CSS
- **data**: Change how the production fields are parsed due to changes in the data type
- **film**: Simplify production details rendering using each block for countries and shares
- **charactersTable**: Replace role display with FilterLink component
- **charactersTable**: Wrap character rows in tbody
- **film**: Remove unused styles from film details page
- **film**: Replace characters section with CharactersTable component

## v0.5.0 (2025-05-09)

### Feat

- **search**: Add a FacetDistributinoPlot to the Search component
- **search**: Add FacetDistributionPlot component for visualising distribution data
- **search**: Update search component to include summary and distribution facets
- **search**: Add release year aggregation to search filters
- **search**: Integrate sveltekit-search-params to read/write search query parameters
- **search**: Add constants for search worker states
- **search**: Add aggregationKey prop to Search component
- **search**: Add aggregation stats display to Search component

### Fix

- **search**: Update search filter handling to use local state
- **search**: Ignore svelte warning

### Refactor

- **search**: Disable spellcheck in SearchInput
- **search**: Replace string literals with constants for worker actions
- **search**: Rename searchStatus and searchError to searchWorkerStatus and searchWorkerError for clarity
- **search**: Change the order of the person metadata in the search results
- **search**: Optimise aggregations handling and filter expansion logic in SearchFilters component

## v0.4.0 (2025-05-06)

### Feat

- **data**: Add helper functions to help prepare data for search
- **index**: Add new search aggregations for release type and production share
- **etl**: Add code/abbreviation expansion to data processing
- **search**: Remember filter toggle state
- **search**: Improve label styling in SearchFilters component
- **search**: Add option to search the search filters
- **layout**: Add GitHub link and changelog version to footer
- **config**: Include app version in Vite configuration
- **config**: Add app version and repository URL to configuration
- **search**: Add functionality to display/remove current filters in SearchFilters component
- **search**: Style SearchFilters component control buttons
- **search**: Clean up empty search filters on filter change
- **search**: Add buttons to exand and clear all filters to SearchFilters component
- **search**: Add SearchControls component for managing search filters and sorting
- **search**: Pass loading and searching states into SearchPagination component

### Fix

- **search**: Use case-insensitive comparison for film type in SearchResultsItems component

### Refactor

- **layout**: Simplify layout structure and improve main content transition
- **film**: Improve data loading logic for development and production environments
- **routes**: Replace person page with biography page
- **data**: Reorganise data retrieval functions for films and biographies
- **search**: Simplify item type handling in SearchResultsItems component
- **data**: Change record types to uppercase
- **data**: Load JSON data dynamically in film and person routes
- **search**: Rename getDataForSearch to getSearchData in API handler
- **search**: Adjust alignment in SearchControls component
- **index**: Update sorting options with labels
- **search**: Update search sorting logic and simplify state management
- **search**: Simplify SearchControls component
- **search**: Update default sort order from 'default_asc' to 'title_asc'
- **landing**: Update hero text color to use primary color variable
- **search**: Change searchResults state to an object
- **search**: Add SearchControls component
- **search**: Update parameters for onSearch and onReset handlers in SearchInput component
- **search**: Improve SearchResults component accessibility
- **search**: Update default sort order in search function to 'default_asc'
- **search**: Simplify search function call

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
- **data**: Add getDataForSearch function to process and format data for search
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
- **biographies, films**: Replace list item components with table components
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
