type SortOrder = 'asc' | 'desc';

type Sorting = {
	label: string;
	field: string;
	order: SortOrder;
};

type SearchAggregation = {
	conjunction: boolean;
	title: string;
	hide_zero_doc_count: boolean;
	size: number;
	sort: string;
};

type SearchAggregations = {
	[key: string]: SearchAggregation;
};

type CorpusConfig = {
	aggregations: SearchAggregations;
	searchableFields: string[];
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
