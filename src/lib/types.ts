export interface Dirigeant {
  nom?: string;
  prenoms?: string;
  denomination?: string;
  anneeNaissance?: number;
  qualite?: string;
  type: "personne physique" | "personne morale";
}

export interface Financials {
  year: number;
  ca: number | null;
  resultatNet: number | null;
}

export interface Company {
  siren: string;
  nom: string;
  naf: string | null;
  categorie: string | null;
  dateCreation: string | null;
  trancheEffectif: string | null;
  adresse: string | null;
  codePostal: string | null;
  commune: string | null;
  departement: string | null;
  dirigeants: Dirigeant[];
  financials: Financials[];
  oppositionProspection: boolean;
}

export interface Signal {
  id: string;
  label: string;
  points: number;
  tone: "positive" | "negative" | "neutral";
}

export interface ScoredCompany extends Company {
  score: number;
  signals: Signal[];
}

export interface SearchFilters {
  q?: string;
  naf?: string[];
  departements?: string[];
  tranches?: string[];
  caMin?: number;
  caMax?: number;
  categorie?: string;
}
