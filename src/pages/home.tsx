export default function Home({ user }: { user: any }) {
  return (
    <main className="bg-body">
      {/* Section Hero améliorée */}
      <section className="py-5 text-center bg-gradient">
        <div className="container py-5">
          <h1 className="fw-bold display-5 mb-4">
            <span className="text-primary">TaskMe</span> : Gestion intelligente des tâches
          </h1>

          <p className="lead text-muted mb-5">
            Planifiez, assignez et suivez toutes les missions de votre organisation
            avec précision, équité et simplicité.
          </p>

          <div className="d-flex justify-content-center gap-3">
            {!user ? (
              <>
                <a href="/login" className="btn btn-primary btn-lg px-5 shadow">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Se connecter
                </a>
                <a href="/register" className="btn btn-outline-primary btn-lg px-5">
                  S'inscrire gratuitement
                </a>
              </>
            ) : (
              <a href="/dashboard" className="btn btn-success btn-lg px-5 shadow">
                <i className="bi bi-speedometer2 me-2"></i>
                Tableau de bord
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités améliorée */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Pourquoi choisir TaskMe ?</h2>
            <p className="text-muted">Des fonctionnalités conçues pour simplifier votre quotidien</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex">
                      <i className="bi bi-cpu fs-3 text-primary"></i>
                    </div>
                  </div>
                  <h5 className="fw-semibold card-title">Affectation intelligente</h5>
                  <p className="card-text text-muted">
                    Assignez les tâches manuellement, semi-automatiquement ou via IA selon 
                    les compétences et disponibilités.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex">
                      <i className="bi bi-graph-up fs-3 text-info"></i>
                    </div>
                  </div>
                  <h5 className="fw-semibold card-title">Suivi complet</h5>
                  <p className="card-text text-muted">
                    Chaque action est tracée : acceptations, refus, délégations ou 
                    modifications pour plus de transparence.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex">
                      <i className="bi bi-columns-gap fs-3 text-success"></i>
                    </div>
                  </div>
                  <h5 className="fw-semibold card-title">Tableau de bord clair</h5>
                  <p className="card-text text-muted">
                    Visualisez la répartition des tâches, les indicateurs d'équité et 
                    la charge de travail en un seul endroit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Interface améliorée */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Interface pensée pour la performance</h2>
          <p className="text-muted mb-5 lead">
            TaskMe facilite la gestion quotidienne, réduit les erreurs administratives
            et offre une visibilité complète à tous les membres de votre équipe.
          </p>
          
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card border-0 shadow">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <div className="bg-danger rounded-circle" style={{ width: 10, height: 10 }}></div>
                      <div className="bg-warning rounded-circle" style={{ width: 10, height: 10 }}></div>
                      <div className="bg-success rounded-circle" style={{ width: 10, height: 10 }}></div>
                    </div>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-3 p-4">
                    <p className="mb-0 text-muted">
                      <i className="bi bi-info-circle me-2"></i>
                      Visualisez vos tâches en un coup d'œil avec notre interface intuitive
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-4">Prêt à commencer ?</h3>
          <p className="text-muted mb-4">
            Rejoignez dès maintenant et transformez votre gestion des tâches
          </p>
          <a 
            href={user ? "/dashboard" : "/register"} 
            className="btn btn-primary btn-lg px-5"
          >
            {user ? "Accéder au tableau de bord" : "Essai gratuit 30 jours"}
          </a>
        </div>
      </section>
    </main>
  );
}