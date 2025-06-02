export interface Person {
	id: string;
	birthYear: number;
	deathYear: number;
	gender: string;
	name: string;
	nationality: string;
	slug: string;
}

export interface Film {
	id: string;
	characters: Character[];
	directors: Person[];
	filmType: string;
	genre: string[];
	media: Media[];
	production: Production[];
	release: Release;
	roles: Role[];
	slug: string;
	synopsis: Synopsis;
	tags?: string[];
	title: { native: string; english: string };
	type: 'Film';
}

export interface Character {
	id: string;
	ability: string;
	age: string;
	assistedMobility: string;
	class: string;
	film?: Film;
	gender: string;
	origin: string;
	person?: Person;
	production?: Production;
	profession: string;
	sexuality: string;
}

export interface Media {
	trailerUrl?: string;
	posterUrl?: string;
}

export interface Person {
	id: string;
	birthYear: number;
	characters?: Character[];
	deathYear: number;
	gender: string;
	name: string;
	nationality: string;
	roles?: Role[];
	slug: string;
	type: 'Person';
}

export interface Production {
	country: string;
	share: string;
}

export interface Release {
	type: string;
	date: string;
	year: number;
}

export interface Role {
	film?: Film;
	person?: Person;
	role?: string;
}

export interface Synopsis {
	native: string;
	english: string;
}

export type Item = Film | Person;
