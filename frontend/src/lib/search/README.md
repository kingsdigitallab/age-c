# Svelte Search Component Template

A flexible search component template that provides full-text search, faceted filtering, sort, pagination, optional insights visualisations, and a web worker for performance. Built for modularity and drop-in customisation.

The template is built with [SvelteKit](https://svelte.dev/kit), [PicoCSS](https://picocss.com/), and uses [ItemsJS](https://github.com/itemsapi/itemsjs/) for faceted filtering and [MiniSearch](https://lucaong.github.io/minisearch/) for full‑text search.

## Features

- Full-text search with optional field scoping
- Faceted search with configurable aggregations
- Dynamic filtering with AND/OR conjunctions (per facet)
- Optional hierarchical facet display and combined facet filters
- Responsive layout with mobile-friendly filters drawer
- Sort options with configurable labels and fields
- Pagination
- Keyboard shortcuts
- Error/status handling surfaced from a web worker
- Optional data insights visualisations (quick and full modes)
- Customisable sub-components
- Web Worker-based search for performance

## Getting Started

1. Copy the `search` directory into your project's `src/lib` folder
2. Set up your data source and configuration
3. Create an API endpoint that serves your data at `/api/search/{dataSource}.json`
4. Import and use the `Search` component in your pages

## Dependencies

- SvelteKit (routing and API)
- [itemsjs](https://github.com/itemsapi/itemsjs) – faceted filtering
- [minisearch](https://lucaong.github.io/minisearch/) – full-text search
- [@picocss/pico](https://picocss.com/) – styling
- [pluralize-esm](https://github.com/sanity-io/pluralize-esm) – pluralisation in summary stats
- [sveltekit-search-params](https://github.com/paoloricciuti/sveltekit-search-params) – URL parameter management
- [@unovis/svelte](https://github.com/unovis-org/unovis/tree/main/packages/svelte) – optional visualisations

## Basic Usage

```svelte
<script>
	import Search from '$lib/search/Search.svelte';
	import { initWorker, cleanupWorker } from '$lib/search/worker.svelte';
	import { onMount } from 'svelte';

	const searchConfig = {
		myDataSource: {
			aggregations: {
				category: {
					conjunction: false,
					title: 'Categories',
					hide_zero_doc_count: true,
					size: 10,
					sort: 'count',
					// optional:
					skijShowConjunctionToggle: true
				}
			},
			searchableFields: ['title', 'description', 'content'], // used by MiniSearch if provided
			nativeSearchConfig: {
				idField: 'id',
				fields: ['title', 'description', 'content'],
				storeFields: ['id']
			},
			sortings: {
				relevance: {
					skijLabel: 'Relevance',
					field: '_score',
					order: 'desc'
				},
				title_asc: {
					skijLabel: 'Title (A–Z)',
					field: 'title',
					order: 'asc'
				}
			},
			// optional advanced features:
			skijCombineFilters: false
		}
	};

	// Optional: let users scope search to certain fields
	const searchScopeOptions = [
		{ label: 'Everywhere', fields: 'full' }, // special value 'full' means unscoped
		{ label: 'Titles', fields: 'title' },
		{ label: 'Descriptions', fields: 'description' },
		{ label: 'Titles + Descriptions', fields: 'title,description' }
	];

	// Optional: quick insights per facet and/or full data insights
	const dataInsightsFacets = [{ facet: 'category', title: 'By Category' }];

	let searchWorker;
	onMount(() => {
		searchWorker = initWorker('/base-path', 'myDataSource', searchConfig);
		return () => cleanupWorker();
	});
</script>

<Search
	dataSource="myDataSource"
	{searchConfig}
	{searchWorker}
	title="Explore the data"
	sortBy="title_asc"
	summaryFacet="type"
	{searchScopeOptions}
	{dataInsightsFacets}
	enableFullDataInsights={false}
	fullDataInsightsPerPage={1000}
	minSearchQueryLength={3}
/>
```

## Configuration

### Types overview

See `src/lib/search/types.ts` for exact types.

- `SearchConfig`: `{ [dataSource: string]: CorpusConfig }`
- `CorpusConfig`:
  - `aggregations`: `{ [facet: string]: SearchAggregation }`
  - `nativeSearchConfig`: MiniSearch options
  - `searchableFields`: string[]
  - `skijCombineFilters`: boolean
  - `sortings`: `{ [key: string]: { skijLabel: string; field: string; order: 'asc'|'desc' } }`
- `SearchAggregation`:
  - `conjunction`: boolean // AND=true, OR=false
  - `title`: string
  - `hide_zero_doc_count`: boolean
  - `size`: number
  - `sort`: string
  - `skijShowConjunctionToggle?`: boolean
  - `skijCombineWith?`: Array<{ [otherFacet: string]: string }>

Notes:

- If `nativeSearchConfig` and `searchableFields` are set, MiniSearch powers full-text matching; IDs from that step are then passed to ItemsJS for faceting, sorting, and pagination.
- If `skijCombineFilters` is enabled, the filters UI will generate combined “hierarchical” filters using an internal separator to allow cross-facet combinations (useful for drilldown pairs like location:::year).

### Required `Search` props

- `dataSource`: key in your `searchConfig`
- `searchConfig`: the configuration object
- `searchWorker`: an instance created by `initWorker(...)`
- `title`: heading for the interface

### Optional `Search` props

- `sortBy`: initial sort key
- `summaryFacet`: facet key to summarise as totals in header
- `dataInsightsFacets`: array of `{ facet, title, dynamicTitle? }` for quick insights
- `enableFullDataInsights`: when true, a separate “insights” query fetches more rows for charts
- `fullDataInsightsPerPage`: page size for the full insights query (default 1000)
- `minSearchQueryLength`: minimum characters before enabling search (default 3)
- `searchInputInFilters`: render the search input inside the filters drawer
- `searchScopeOptions`: array of `{ label, fields }` to let users scope full-text search to selected fields; use `'full'` to search unscoped

### Custom components

You can replace any sub-component via props:

- `SearchShortcutsComponent`
- `SearchStatusComponent`
- `SearchInputComponent`
- `DataInsightsComponent`
- `SearchFiltersComponent`
- `SearchControlsComponent`
- `SearchResultsComponent`
- `SearchResultsItemsComponent`
- `SearchPaginationComponent`

## Loading Data

Create an endpoint at `/api/search/{dataSource}.json` that returns your array of items. The worker fetches:

- `GET {basePath}/api/search/{dataSource}.json`

Example SvelteKit route: `src/routes/api/search/[slug].json/+server.ts`.

## URL Parameters

Managed automatically via `sveltekit-search-params`:

- `query`: string
- `scope`: string (e.g. `full`, `title`, `title,description`)
- `page`: number
- `filters`: JSON-encoded object
- `sort`: string

## Web Worker

### Initialisation

```ts
import { initWorker, cleanupWorker } from '$lib/search/worker.svelte';

const worker = initWorker(basePath, dataSource, searchConfig);

// later
cleanupWorker();
```

Internally, the worker:

- Loads data and initialises search engines (ItemsJS and optionally MiniSearch)
- Responds to search requests and returns results
- Supports a secondary “insights” request for larger result sets

You can read status and error signals if needed:

```ts
import { getWorkerStatus, getWorkerError } from '$lib/search/worker.svelte';
```

### Message protocol

Actions (see `src/lib/search/config.ts`):

- `load`: `{ basePath, dataSource, config, reload? }`
- `ready`
- `search`: `{ dataSource, query, queryFields?, page?, perPage?, sort?, filters? }`
- `results`: `{ query, results }`
- `insights`: same payload as `search` but typically with `perPage` set high
- `insights_results`: `{ query, results }`
- `error`: `{ message }`

Notes:

- `queryFields` is derived from `scope` in the UI. If scope is `'full'`, full-text search uses all configured searchable fields; otherwise it uses the provided subset.
- When conjunctions change, the UI triggers a `load` with `reload: true` to rebuild the ItemsJS engine with updated conjunction logic.

## Customisation

- Adapt `searchConfig` to your data structure
- Toggle `skijShowConjunctionToggle` per facet to let users choose AND/OR at runtime
- Use `skijCombineFilters` and `skijCombineWith` for cross-facet combinations (e.g., category:::subCategory)
- Replace sub-components for custom UI or visuals
- Tune MiniSearch’s `nativeSearchConfig` for better recall/precision

## Styling

The layout uses CSS custom properties and PicoCSS conventions.

- Main container class: `skij-search-layout`
- Filters drawer and controls use `skij-` prefixed classes that you can override globally.

## Project Structure

src/lib/search/

- Search.svelte — main search component
- SearchControls.svelte — controls (toggle filters, etc.)
- SearchFilters.svelte — filters UI and logic
- SearchInput.svelte — search form and scope selector
- SearchPagination.svelte — pagination controls
- SearchResults.svelte — results container with sorting
- SearchResultsItems.svelte — items renderer (replaceable)
- SearchShortcuts.svelte — keyboard shortcuts
- SearchStatus.svelte — loading/searching/error banners
- DataInsights.svelte — optional insights visualisations
- types.ts — TypeScript definitions
- config.ts — constants and separators
- worker.svelte.ts — worker lifecycle and state helpers
- worker.ts — worker implementation
- search.ts — search engines orchestration (ItemsJS + MiniSearch)
