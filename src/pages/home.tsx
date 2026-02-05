export default function Home({ user }: { user: any }) {
  return (
    <main className="bg-body">
      
      {/* Section Hero */}
      <section className="py-5 text-center">
        <div className="container">
          <h1 className="fw-bold display-5">
            TaskMe : Gestion intelligente des tâches
          </h1>

          <p className="mt-4 text-muted fs-5">
            Planifiez, assignez et suivez toutes les missions de votre organisation
            avec précision, équité et simplicité.
          </p>

          <div className="mt-4">
            {!user && (
              <a href="/login" className="btn btn-primary btn-lg px-5">
                Se connecter
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">Affectation intelligente</h5>
                <p className="text-muted mt-3">
                  Assignez les tâches manuellement, semi-automatiquement ou via IA selon les compétences et disponibilités.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">Suivi complet</h5>
                <p className="text-muted mt-3">
                  Chaque action est tracée : acceptations, refus, délégations ou modifications pour plus de transparence.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">Tableau de bord clair</h5>
                <p className="text-muted mt-3">
                  Visualisez la répartition des tâches, les indicateurs d’équité et la charge de travail en un seul endroit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section Productivité */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="fw-bold">Interface pensée pour la performance</h2>
          <p className="mt-3 text-muted">
            TaskMe facilite la gestion quotidienne, réduit les erreurs administratives
            et offre une visibilité complète à tous les membres de votre équipe.
          </p>
        </div>
      </section>

    </main>
  );
}
