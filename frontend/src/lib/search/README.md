# Svelte Search Component Template

A flexible search component template that provides faceted search, pagination,
sorting, and dynamic visualisations. This template is designed to be used as a
starting point for implementing search and data exploration features.

The template is built with [SvelteKit](https://svelte.dev/kit),
[PicoCSS](https://picocss.com/), and
[ItemsJS](https://github.com/itemsapi/itemsjs/) as the default search engine.
The principles should be applicable to any other frontend framework and search
engines.

## Features

- Full-text search with configurable fields
- Faceted search with configurable aggregations
- Dynamic filtering with AND/OR conjunctions
- Responsive layout with mobile-friendly filters
- Data visualisation with distribution plots
- Pagination support
- Custom sorting options
- Keyboard shortcuts
- Customisable components
- Web Worker-based search for performance

## Getting Started

1. Copy the `search` directory into your project's `src/lib` folder
1. Set up your data source and configuration
1. Import and use the Search component in your pages

## Dependencies

- SvelteKit (for routing and API endpoints)
- `[itemsjs](https://github.com/itemsapi/itemsjs/tree/master)` - For search
- `[@picocss/pico](https://picocss.com/)` - For styling
- `[pluralize-esm](https://github.com/sanity-io/pluralize-esm)` - For pluralisation in summary statistics
- `[sveltekit-search-params](https://github.com/paoloricciuti/sveltekit-search-params)` - For URL search parameter management
- `[@unovis/svelte](https://github.com/unovis-org/unovis/tree/main/packages/svelte)` - For visualisations

## Basic Usage

```svelte
<script>
	import { Search } from '$lib/search/Search.svelte';
	import { searchWorker } from '$lib/search/worker.svelte';

	const searchConfig = {
		myDataSource: {
			aggregations: {
				category: {
					conjunction: false,
					title: 'Categories',
					hide_zero_doc_count: true,
					size: 10,
					sort: 'count'
				}
			},
			searchableFields: ['title', 'description', 'content'],
			sortings: {
				relevance: {
					label: 'Relevance',
					field: '_score',
					order: 'desc'
				}
			}
		}
	};
</script>

<Search dataSource="myDataSource" {searchConfig} title="Explore the data" {searchWorker} />
```

## Configuration

### Required Props

- `dataSource`: Key identifying the data source in the search configuration
- `searchConfig`: Configuration object defining the search behavior
- `searchWorker`: Web Worker instance for handling search operations
- `title`: Title displayed at the top of the search interface

### Optional Props

- `sortBy`: Default sorting option
- `summaryFacet`: Facet to use for summary statistics
- `distributionFacets`: Array of facets to show in distribution plots
- `minSearchQueryLength`: Minimum query length (default: 3)

### Custom Components

The search interface is composed of several components that you can customize:

- `SearchShortcuts` - Keyboard shortcut handling
- `SearchStatus` - Search status messages
- `SearchInput` - Search input field
- `SearchFacetDistributionPlot` - Visualization of facet distributions
- `SearchFilters` - Faceted filtering interface
- `SearchControls` - Sort and filter controls
- `SearchResults` - Search results container
- `SearchResultsItems` - Individual search result items
- `SearchPagination` - Pagination controls

## Loading Data

The search component is designed to be used with an API endpoint that provides
the searchable data. The data format should match the search configuration.

## URL Parameters

The search component automatically manages these URL parameters, via the
`sveltekit-search-params` library:

- `query`: Search query string
- `page`: Current page number
- `filters`: Applied filters (as JSON object)
- `sort`: Current sorting option

## Styling

The component uses CSS custom properties for styling and follows a responsive
layout. The main layout class is `skij-search-layout` which can be customised in
your application's CSS.

## Web Worker Implementation

The template includes a basic web worker setup for handling search operations.
The worker manages:

- Loading and initialising the search engine
- Processing search requests
- Returning search results

### Setting up the Web Worker

1. First, create a route to serve your search data at, e.g.,
   `/api/search/{dataSource}.json`
1. Initialise the worker in your page or layout:

```js
import { initWorker, cleanupWorker } from '$lib/search/worker.svelte';

// In your component's script or layout
onMount(() => {
	const worker = initWorker('/base-path', 'myDataSource', searchConfig);

	return () => {
		cleanupWorker(); // Clean up when component is destroyed
	};
});
```

The worker system is built to be extensible. The main components are:

- `worker.svelte.ts` - Manages worker lifecycle and state
- `worker.ts` - The actual web worker implementation
- `search.ts` - Search engine implementation

The worker communicates using a simple message protocol:

```ts
// Initialize search
{ action: 'load', payload: { basePath, dataSource, config } }

// Perform search
{ action: 'search', payload: { dataSource, query, page, perPage, sort, filters } }

// Receive results
{ action: 'results', payload: { query, results } }
```

## Customisation

To adapt this template for your needs:

1. Modify the search configuration to match your data structure
2. Customise the components to match your UI requirements
3. Implement your own search logic in the worker
4. Adjust the styling to match your design system

## Project Structure

src/lib/search/
├── Search.svelte # Main search component
├── SearchControls.svelte # Search controls component
├── SearchFilters.svelte # Faceted filters component
├── SearchInput.svelte # Search input component
├── SearchPagination.svelte # Pagination component
├── SearchResults.svelte # Results display component
├── types.ts # TypeScript type definitions
├── config.ts # Configuration constants
├── worker.svelte.ts # Web worker implementation
├── worker.ts # Web worker implementation
└── search.ts # Search engine implementation
