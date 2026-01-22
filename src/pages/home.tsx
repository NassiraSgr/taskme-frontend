export default function Home({user} : {user:any}) {
  return (
  
    <main className="bg-body">
      <section className="py-5 text-center">
        <div className="container">
          <h1 className="fw-bold display-5">
            Gestion intelligente des tâches & affectations
          </h1>

          <p className="mt-4 text-muted fs-5">
            Une plateforme centralisée pour planifier, assigner et suivre toutes les missions
            avec précision, équité et simplicité.
          </p>

          <div className="mt-4">
            {
                !user && (
                <a href="/login" className="btn btn-primary btn-lg px-5">
                    Se connecter
                </a>
                )
            }
            
          </div>
        </div>
      </section>
      <section className="py-5">
        <div className="container">
          <div className="row g-4">

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">
                  Affectation simple
                </h5>
                <p className="text-muted mt-3">
                  Choisissez entre affectation manuelle, semi-automatique ou intelligente,
                  selon vos besoins opérationnels.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">
                  Historique détaillé
                </h5>
                <p className="text-muted mt-3">
                  Chaque action est enregistrée : affectations, réponses,
                  délégations, modifications ou refus.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center p-4">
                <h5 className="fw-semibold">
                  Dashboard clair
                </h5>
                <p className="text-muted mt-3">
                  Visualisez la charge, l’équité, la répartition des tâches
                  et les indicateurs clés en un seul endroit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-5 text-center">
        <div className="container">
          <h2 className="fw-bold">
            Une interface pensée pour la productivité
          </h2>

          <p className="mt-3 text-muted">
            TaskMe simplifie la gestion administrative quotidienne,
            réduit le temps de traitement et offre une visibilité complète
            à chaque membre de l’organisation.
          </p>
        </div>
      </section>

    </main>
  );
}
