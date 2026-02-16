import React, { useEffect, useState, useCallback } from "react";
import "./HistoriqueDashboard.css"; 

interface Acteur {
  firstName: string;
  lastName: string;
}

interface Task {
  nom: string;
}

interface HistoriqueItem {
  _id: string;
  acteur?: Acteur;
  type: string;
  taskId?: Task;
  cible?: Acteur;
  date: string;
}

interface User {
  id?: string;
  role?: string;
}

const HistoriqueDashboard = ({ user }: { user: User }) => {
  const [historique, setHistorique] = useState<HistoriqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fonction pour récupérer l'historique
  const fetchHistorique = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/historique", {
        method: 'GET',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: Impossible de récupérer l'historique`);
      }

      const data = await res.json();
      setHistorique(data);
      setSuccessMessage(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error("Erreur fetchHistorique:", err);
      setHistorique([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour supprimer tout l'historique
  const handleDeleteAll = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer tout l'historique ? Cette action est irréversible.")) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/historique/delete-all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: Impossible de supprimer l'historique`);
      }

      setHistorique([]);
      setSuccessMessage("Historique supprimé avec succès");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la suppression";
      setError(errorMessage);
      console.error("Erreur suppression:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorique();
    
    // Rafraîchissement toutes les 30 secondes
    const intervalId = setInterval(fetchHistorique, 30000);
    
    // Nettoyage à la destruction du composant
    return () => clearInterval(intervalId);
  }, [fetchHistorique]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && historique.length === 0) {
    return (
      <div className="historique-container loading-state">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <div className="header-section">
        <h2>Historique des actions</h2>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Erreur :</strong> {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Fermer"
            />
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Succès :</strong> {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage(null)}
              aria-label="Fermer"
            />
          </div>
        )}

        {historique.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={deleteLoading}
            className="btn btn-danger delete-button"
            aria-label="Supprimer tout l'historique"
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Suppression en cours...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Supprimer l'historique
              </>
            )}
          </button>
        )}
      </div>

      {historique.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-clock-history empty-icon"></i>
          <p className="empty-message">Historique vide</p>
          <p className="empty-submessage">Aucune action n'a encore été enregistrée</p>
        </div>
      ) : (
        <>
          <div className="stats-badge">
            <span className="badge bg-info">
              {historique.length} action{historique.length > 1 ? 's' : ''} enregistrée{historique.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="list-group historique-list">
            {historique.map((item, index) => (
              <div 
                key={item._id || index} 
                className="list-group-item historique-item"
              >
                <div className="item-content">
                  <div className="item-header">
                    <strong className="acteur-name">
                      {item.acteur?.firstName} {item.acteur?.lastName}
                    </strong>
                    <span className={`badge action-badge action-${item.type?.toLowerCase() || 'default'}`}>
                      {item.type}
                    </span>
                  </div>

                  <div className="item-details">
                    {item.taskId && (
                      <span className="task-info">
                        <i className="bi bi-check-circle me-1"></i>
                        Tâche : "{item.taskId.nom}"
                      </span>
                    )}
                    
                    {item.cible && (
                      <span className="target-info">
                        <i className="bi bi-person me-1"></i>
                        Cible : {item.cible.firstName} {item.cible.lastName}
                      </span>
                    )}
                  </div>

                  <div className="item-footer">
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(item.date)}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoriqueDashboard;