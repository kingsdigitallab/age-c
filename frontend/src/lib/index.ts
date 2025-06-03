import type { SearchConfig } from './search/types';

export const config = {
	siteUrl: 'https://age-c.eu',
	siteName: 'AGE-C',
	siteTitle: 'Ageing and Gender in European Cinema',
	siteDescription: 'An exploratory database of ageing and gender in European cinema',
	siteKeywords: ['ageing', 'gender', 'cinema', 'european cinema'],
	emptyPlaceholder: 'Unknown',
	appVersion: import.meta.env.APP_VERSION,
	repoUrl: 'https://github.com/kingsdigitallab/age-c'
};

export const hero = {
	title: 'Dataset Exploration',
	description: 'Ageing and Gender in European Cinema'
};

const searchAggregations = {
	type: {
		title: 'Type',
		hide_zero_doc_count: true,
		size: 2,
		sort: 'key',
		conjunction: false
	},
	releaseYear: {
		title: 'Release year',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key',
		conjunction: false
	},
	releaseType: {
		title: 'Release type',
		hide_zero_doc_count: true,
		size: 5,
		sort: 'key',
		conjunction: false
	},
	filmType: {
		title: 'Film type',
		hide_zero_doc_count: true,
		size: 5,
		sort: 'key',
		conjunction: false
	},
	genre: {
		title: 'Genre',
		hide_zero_doc_count: true,
		size: 100,
		sort: 'key',
		conjunction: false
	},
	productionCountry: {
		title: 'Production country',
		hide_zero_doc_count: true,
		size: 100,
		sort: 'key',
		conjunction: false
	},
	productionShare: {
		title: 'Production share',
		hide_zero_doc_count: true,
		size: 5,
		sort: 'key',
		conjunction: false
	},
	role: {
		title: 'Role',
		hide_zero_doc_count: true,
		size: 100,
		sort: 'key',
		conjunction: false
	},
	gender: {
		title: 'Person gender',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	nationality: {
		title: 'Person nationality',
		hide_zero_doc_count: true,
		size: 300,
		sort: 'key',
		conjunction: false
	},
	tags: {
		title: 'Tags',
		hide_zero_doc_count: true,
		size: 500,
		sort: 'key',
		conjunction: false
	},
	characterAge: {
		title: 'Character age',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	characterGender: {
		title: 'Character gender',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	characterSexuality: {
		title: 'Character sexuality',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	characterOrigin: {
		title: 'Character origin',
		hide_zero_doc_count: true,
		size: 50,
		sort: 'key',
		conjunction: false
	},
	characterClass: {
		title: 'Character class',
		hide_zero_doc_count: true,
		size: 20,
		sort: 'key',
		conjunction: false
	},
	characterProfession: {
		title: 'Character profession',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	characterAbility: {
		title: 'Character ability',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	},
	assistedMobility: {
		title: 'Assisted mobility',
		hide_zero_doc_count: true,
		size: 10,
		sort: 'key',
		conjunction: false
	}
};

export const searchConfig: SearchConfig = {
	corpus: {
		aggregations: searchAggregations,
		searchableFields: ['title', 'name', 'text', ...Object.keys(searchAggregations)],
		sortings: {
			person_name_asc: {
				label: 'Person name (A-Z)',
				field: 'name',
				order: 'asc'
			},
			person_name_desc: {
				label: 'Person name (Z-A)',
				field: 'name',
				order: 'desc'
			},
			film_title_asc: {
				label: 'Film title (A-Z)',
				field: 'title',
				order: 'asc'
			},
			film_title_desc: {
				label: 'Film title (Z-A)',
				field: 'title',
				order: 'desc'
			}
		}
	}
};
