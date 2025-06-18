type SortOrder = 'asc' | 'desc';

type Sorting = {
	skijLabel: string;
	field: string;
	order: SortOrder;
};

export type SearchAggregation = {
	conjunction: boolean;
	title: string;
	hide_zero_doc_count: boolean;
	size: number;
	skijCombineWith?: { [key: string]: string }[];
	skijShowConjunctionToggle: boolean;
	sort: string;
};

export type SearchAggregations = {
	[key: string]: SearchAggregation;
};

type CorpusConfig = {
	aggregations: SearchAggregations;
	searchableFields: string[];
	skijCombineFilters: boolean;
	sortings: {
		[key: string]: Sorting;
	};
};

export type SearchConfig = {
	[key: string]: CorpusConfig;
};

export type SearchEngineKey = string;

export interface SearchParams {
	dataSource: SearchEngineKey;
	query: string;
	page?: number;
	perPage?: number;
	sort?: string;
	filters?: Record<string, string[]>;
}
