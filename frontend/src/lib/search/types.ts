type SortOrder = 'asc' | 'desc';

type Sorting = {
	field: string;
	order: SortOrder;
};

type SearchAggregation = {
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
	searchableFields: (string | string[])[];
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
	perPage?: number;
	sort?: string;
	filters?: Record<string, string[]>;
}
