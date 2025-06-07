# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.14.0 (2025-06-07)

### Feat

- **data-insights**: Added nested donut chart visualisation
- **data-insights**: Add donut plot type option to DataInsightsConfig
- **app.css**: Add font size variable for nested donut segment labels
- **data-insights**: Add DataInsightsTable component
- **data-insights**: Add DataInsightsConfig component
- **data-insights**: Add plot type selection and support for grouped bar charts
- **search-filters**: Add support for hierarchical bucket values
- **app.css**: Add table styling for nested lists
- **data**: Implement getTags function to extract and format tags for films
- **data**: Add new tags.json file with tags hierarchy
- **data**: Add 'text' field to search data

### Fix

- **etl**: Ensure release type is only expanded once
- **data-insights**: Init selectedGroupByFacet with an empty string

### Refactor

- **data-insights**: Adjust height of donut chart
- **search-filters**: Replace hardcoded hierarchy separator with a constant
- **glossary**: Update filter links to include hierarchical tag structure
- **data-insights**: Extract facet value matching logic into a separate function
- **data-insights**: Remove redundant derived state `filteredGroupByFacetValues`
- **data-insights**: Simplify plot type handling and improve metadata management
- **index**: Add field 'text' to searchable fields
- Rename biography routes to person

## v0.13.0 (2025-06-02)

### Feat

- **person-roles-table**: Add PersonRolesTable component to display roles with film details
- **film-roles-table**: Add FilmRolesTable component to display actor roles with relevant details
- **layout**: Keep footer at the bottom of the page
- **app.css**: Add font size to table elements and remove list style for inline layout
- **landing**: Add button to link to explore section
- **styleguide**: Add Cards section
- **app.css**: Add complementary color variables for charts

### Fix

- **DataInsights**: Add warning comment for local state reference in DataInsights component

### Refactor

- **search-summary**: Update summary stats display to use paragraph and strong tags for better semantics and styling
- **search-filters**: Adjust max-width for search filters on larger screens
- **search**: Adjust gap between search filters and page content
- **search-results-items**: Update rendering logic for films and persons, improve type handling, and role display
- **filter-link**: Update type definitions and conditional rendering logic
- **film-link**: Enhance film link component to handle non-object film types and improve year display logic
- **director-link**: Update type from Director to Person and improve display logic for director information
- **characters-table**: Enhance type definitions and remove deprecated data
- **biography**: Improve age and gender display logic
- **film**: Update film data handling and component structure to incorporate roles and improve type definitions
- **biography**: Update biography data handling and component structure to support new roles and character data
- **data**: Update data processing functions to handle new data format
- **types**: Revise type definitions for Film, Person, Character, and related interfaces
- **DataInsights**: Simplify header structure
- **app.css**: Update article border styles and adjust border radius
- **links**: Update base path handling in multiple components for consistency
- **FilterLink**: Simplify base path handling in FilterLink component and update references in glossary
- **FilterLink**: Update base path handling
- **search**: Wrap SearchResultsComponent and SearchPaginationComponent in an article

### Perf

- **etl**: Restructure data processing functions

## v0.12.0 (2025-05-30)

### Feat

- **index.ts**: Add hero section with title and description for dataset exploration
- **app.css**: Add new color scheme variables and body background gradient
- **DevOnly**: Enhance debug functionality with keyboard shortcuts for toggling debug elements
- **DevOnly**: Add DevOnly component to conditionally render content in a dev environment
- **search**: Add option to choose the search input placement
- **layout**: Add conditional link to styleguide for development environment
- **app.css**: Add font and surface styles
- **styleguide**: Add style guide component with typography, colors, buttons, and forms
- **etl**: Add analysis scripts and notebooks for exploring and debugging data

### Refactor

- **hero**: Integrate hero data into layout and style title and description
- **layout**: Update layout styles and improve footer structure
- **DataInsights**: Add overflow styling to data display section
- **CharactersTable**: Wrap table in a div for overflow styling
- **DataInsights**: Add overflow styling to data display section
- **search**: Move sorting functionality to SearchResults
- **search**: Simplify search controls by removing unused properties and updating button text
- **search**: Consolidate search controls and results handling
- **search**: Update search results terminology
- **biography, film**: Update class names for inline styles
- **styleguide**: Update class names for surfaces
- **app.css**: Organise CSS structure
- **search**: Move total search results to the summary stats section
- **DataInsights**: Replace direct dev checks with DevOnly component
- **layout**: Replace dev environment check with DevOnly component and update styleguide link placement
- **search**: Move search input into filters section
- **landing**: Update header font class

## v0.11.0 (2025-05-27)

### Feat

- **search**: Integrate DataInsights component into search results
- **search**: Add INSIGHTS handling to search worker
- **search**: Add INSIGHTS and INSIGHTS_RESULTS statuses to search configuration
- **search**: Add full data insights functionality in Search.svelte
- **search**: Add searchItems prop to DataInsights
- **search**: Add DataInsights component for advanced data visualiaation
- **search**: Add adjustable chart height and improve layout in FacetDistributionPlot
- **search**: Improve FacetDistributionPlot with loading state and dynamic facet selection
- **accessibility**: Add accessibility statement page and link in footer
- **search**: Add aria labels and data toggle to FacetDistributionPlot

### Fix

- **search**: Improve optional visTitle handling in FacetDistributionPlot

### Refactor

- **app.css**: Comment out  chart colours
- **insights**: Extract data transformation logic into helper file
- **landing**: Update import path to DataInsights component
- **search**: Replace FacetDistributionPlot with DataInsights in Search.svelte
- **search**: Rename FacetDistributionPlot as DataInsights
- **search**: Update FacetDistributionPlot layout to horizontal orientation
- **search**: Simplify Search.svelte
- **search**: Update search toggle  to focus on filters section
- **search**: Add ID to toggle filters button for improved accessibility
- **search**: Remove tabindex from filters aside and add ID to close button for accessibility

## v0.10.0 (2025-05-19)

### Feat

- **routes**: Add sitemap.xml route
- **config**: Add site URL

### Refactor

- **routes**: Add data for SEO to the film and bio routes
- **layout**: Improve SEO by adding canonical link and fixing keyword handling
- **layout**: Enhance SEO metadata handling with derived properties for title, description, and keywords
- **mdsvex**: Remove deprecated layout configuration
- **routes**: Migrate dynamic page loading to new structure
- **markdown**: Simplify markdown content editing

## v0.9.0 (2025-05-16)

### Feat

- **search**: Add dynamic title support to FacetDistributionPlot component

### Fix

- **data**: Update field keys for automatic data extraction

### Refactor

- **search**: Update facet titles for clarity and consistency
- **search**: Restructure visualisation section
- **search**: Show filters/search side by side on larger screens
- **search**: Do not disable the show filters button
- **search**: Rename search-related classes and variables for consistency

## v0.8.0 (2025-05-15)

### Feat

- **search**: Add conjunction options to search filters
- **search**: Implement conjunction handling in search configuration
- **config**: Add conjunction option to search aggregations
- **search**: Add option to reload the search engine
- **search**: Add reloadSearchEngine function
- **search**: Add label for distribution facet selection in search component

### Refactor

- **layout**: Update search worker initialisation to use search configuration
- **search**: Change worker initialisation to accept configuration options

## v0.7.0 (2025-05-14)

### Feat

- **app.css**: Add styles for output element
- **search**: Add ERROR status to WORKER_STATUS
- **search**: Add search worker manager
- **landing**: Add role distribution facet to data visualisation
- **layout**: Add Glossary link to navigation
- **glossary**: Add of tags and terms
- **FilterLink**: Improve filter link rendering to conditionally display children or value

### Fix

- **search**: Reset filters on new search query
- **search**: Update WORKER_STATUS IDLE value to lowercase 'idle'
- **data**: Override person_id with person_name in role DataFrame due to issues with the data

### Refactor

- **search**: Simplify search worker initialization and error handling
- **error**: Move styles from error page component to app.css

### Perf

- **landing**: Re-use the search worker loaded in the layout
- **layout**: Terminate search worker onDestroy
- **layout**: Initialise the search worker at the layout level

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
