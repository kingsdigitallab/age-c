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
		size: 2,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: false
	},
	releaseYear: {
		title: 'Release year',
		size: 100,
		sort: 'key',
		conjunction: false,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: false
	},
	releaseType: {
		title: 'Release type',
		size: 5,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	filmType: {
		title: 'Film type',
		size: 5,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	genre: {
		title: 'Genre',
		size: 100,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	productionCountryShare: {
		title: 'Production',
		size: 500,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	role: {
		title: 'Role',
		size: 100,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	birthYear: {
		title: 'Birth year',
		size: 100,
		sort: 'key',
		conjunction: false,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: false
	},
	gender: {
		title: 'Person gender',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	nationality: {
		title: 'Person nationality',
		size: 300,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	tags: {
		title: 'Tags',
		size: 500,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterAge: {
		title: 'Character age',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterGender: {
		title: 'Character gender',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterSexuality: {
		title: 'Character sexuality',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterOrigin: {
		title: 'Character origin',
		size: 50,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterClass: {
		title: 'Character class',
		size: 20,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterProfession: {
		title: 'Character profession',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	characterAbility: {
		title: 'Character ability',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	},
	assistedMobility: {
		title: 'Assisted mobility',
		size: 10,
		sort: 'key',
		conjunction: true,
		chosen_filters_on_top: false,
		hide_zero_doc_count: false,
		skijShowConjunctionToggle: true
	}
};

export const searchConfig: SearchConfig = {
	corpus: {
		aggregations: searchAggregations,
		searchableFields: ['title', 'name', 'text', ...Object.keys(searchAggregations)],
		sortings: {
			person_name_asc: {
				skijLabel: 'Person name (A-Z)',
				field: 'name',
				order: 'asc'
			},
			person_name_desc: {
				skijLabel: 'Person name (Z-A)',
				field: 'name',
				order: 'desc'
			},
			film_title_asc: {
				skijLabel: 'Film title (A-Z)',
				field: 'title',
				order: 'asc'
			},
			film_title_desc: {
				skijLabel: 'Film title (Z-A)',
				field: 'title',
				order: 'desc'
			}
		}
	}
};
