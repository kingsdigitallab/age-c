export interface Director {
	id: string;
	slug: string;
	name: string;
	birthYear: number;
	deathYear: number;
	gender: string;
	nationality: string;
	filmType: string;
	release: Release;
	production: Production;
}

export interface Person {
	id: string;
	slug: string;
	name: string;
	birthYear: number;
	deathYear: number;
	gender: string;
	nationality: string;
}

export interface Film {
	id: string;
	slug: string;
	title: { native: string; english: string };
	filmType: string;
	genre: string[];
	release: Release;
	tags?: string[];
	production: Production;
}
export interface Character {
	id: string;
	age: string;
	gender: string;
	sexuality: string;
	origin: string;
	class: string;
	profession: string;
	ability: string;
	assistedMobility: string;
	person?: Person;
	film?: Film;
	role: string;
}

export interface Release {
	type: string;
	date: string;
	year: number;
}

export interface Production {
	country: string;
	share: string;
}

export interface Media {
	trailerUrl?: string;
	posterUrl?: string;
}

export interface Item extends Film {
	id: string;
	type: 'film' | 'biography';
	media: Media;
	director: Director[];
	character: Character[];
	synopsis?: { native: string; english: string };
	name?: string;
	birthYear?: string;
	deathYear?: string;
	nationality?: string;
	gender?: string;
}
