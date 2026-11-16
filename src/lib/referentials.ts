/** INSEE "tranche d'effectif salarié" codes. */
export const TRANCHES: Record<string, string> = {
  "00": "0 salarié",
  "01": "1-2",
  "02": "3-5",
  "03": "6-9",
  "11": "10-19",
  "12": "20-49",
  "21": "50-99",
  "22": "100-199",
  "31": "200-249",
  "32": "250-499",
  "41": "500-999",
  "42": "1 000-1 999",
  "51": "2 000-4 999",
  "52": "5 000-9 999",
  "53": "10 000+",
};

/** Sector presets mapped to NAF rev.2 codes, tuned for mid-market M&A theses. */
export const SECTORS: { id: string; label: string; naf: string[] }[] = [
  { id: "software", label: "Éditeurs de logiciels & ESN", naf: ["58.29C", "62.01Z", "62.02A", "62.03Z", "62.09Z"] },
  { id: "industry", label: "Industrie mécanique", naf: ["25.62B", "28.29B", "28.41Z", "33.12Z", "25.11Z"] },
  { id: "food", label: "Agroalimentaire", naf: ["10.13A", "10.71C", "10.82Z", "10.89Z", "11.02B"] },
  { id: "btp", label: "BTP second œuvre", naf: ["43.21A", "43.22A", "43.22B", "43.32A", "43.34Z"] },
  { id: "health", label: "Santé & medtech", naf: ["32.50A", "86.90A", "86.90B", "46.46Z", "21.20Z"] },
  { id: "services", label: "Services B2B", naf: ["70.22Z", "73.11Z", "78.10Z", "81.21Z", "82.11Z"] },
  { id: "transport", label: "Transport & logistique", naf: ["49.41A", "49.41B", "52.10B", "52.29A"] },
];

export const CATEGORIES = ["PME", "ETI", "GE"] as const;

export const formatEuro = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 }).format(n);
