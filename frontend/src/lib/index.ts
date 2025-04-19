export const config = {
	title: 'AGE-C',
	fullTitle: 'Ageing and Gender in European Cinema'
};

const filmSearchAggregations = {
	type: {
		title: 'Type',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	genre: {
		title: 'Genre',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	country: {
		title: 'Country',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	tags: {
		title: 'Tags',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	directorGender: {
		title: 'Director gender',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	directorNationality: {
		title: 'Director nationality',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charAge: {
		title: 'Character age',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charGender: {
		title: 'Character gender',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charSexuality: {
		title: 'Character sexuality',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charOrigin: {
		title: 'Character origin',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charClass: {
		title: 'Character class',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charProfession: {
		title: 'Character profession',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	charAbility: {
		title: 'Character ability',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	},
	assistedMobility: {
		title: 'Assisted mobility',
		hide_zero_doc_count: true,
		size: 1000,
		sort: 'key'
	}
};

const biographiesSearchAggregations = {
	perGender: {
		title: 'Gender',
		hide_zero_doc_count: true,
		size: 5,
		sort: 'key'
	},
	perNationality: {
		title: 'Nationality',
		hide_zero_doc_count: true,
		size: 5,
		sort: 'key'
	}
};

export const searchConfig = {
	biographies: {
		aggregations: biographiesSearchAggregations,
		searchableFields: ['perName', Object.keys(biographiesSearchAggregations)],
		sortings: {
			perName_asc: {
				field: 'perName',
				order: 'asc'
			},
			perName_desc: {
				field: 'perName',
				order: 'desc'
			}
		}
	},
	films: {
		aggregations: filmSearchAggregations,
		searchableFields: [
			'title',
			'titleEn',
			'synopsis',
			'synopsisEn',
			Object.keys(filmSearchAggregations)
		],
		sortings: {
			title_asc: {
				field: 'title',
				order: 'asc'
			},
			title_desc: {
				field: 'title',
				order: 'desc'
			}
		}
	}
};
