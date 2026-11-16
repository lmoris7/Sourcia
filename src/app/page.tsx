import Link from "next/link";

const FEATURES = [
  { title: "Registre national en direct", text: "Plus de 30 millions d'entreprises françaises via l'API officielle Recherche d'entreprises : NAF, effectifs, comptes publiés, dirigeants." },
  { title: "Score de cessibilité explicable", text: "Âge du dirigeant, gouvernance, maturité, rentabilité, croissance : chaque point du score vient d'un signal visible." },
  { title: "Fiche cible & approche par IA", text: "Une fiche cible, des questions pour le premier call et un email d'approche, rédigés en un clic à partir des données publiques." },
  { title: "Pipeline de deal flow", text: "Suivez chaque cible de « à qualifier » à « NDA signé », annotez, exportez vers Excel ou votre CRM." },
];

const STEPS = [
  ["1", "Décrivez le mandat", "Secteur, zone, taille, CA."],
  ["2", "Sourcia classe les cibles", "Les PME les plus susceptibles de céder remontent en tête."],
  ["3", "Approchez au bon moment", "Fiche, email, suivi dans le pipeline."],
];

export default function Landing() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-semibold tracking-tight">Sourc<span className="text-indigo-600 dark:text-indigo-400">ia</span></span>
        <Link href="/app" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">
          Ouvrir l&apos;application
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <p className="mb-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">Pour boutiques M&A, fonds small-cap et corporate development</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Trouvez les PME à céder <br className="hidden sm:block" />avant qu&apos;elles ne soient sur le marché.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Sourcia croise le registre national des entreprises avec des signaux de transmission pour classer vos cibles et préparer l&apos;approche.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/app" className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700">Lancer un sourcing</Link>
            <a href="#how" className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Voir le fonctionnement</a>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h2 className="font-medium">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-4xl px-4 py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Trois étapes</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{n}</span>
                <h3 className="mt-2 font-medium">{t}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Données publiques INSEE / RNE via recherche-entreprises.api.gouv.fr. Les oppositions à la prospection commerciale sont respectées.
      </footer>
    </div>
  );
}
