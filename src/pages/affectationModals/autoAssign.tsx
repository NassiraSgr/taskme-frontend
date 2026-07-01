import React, { useEffect } from "react";

interface AutoAssignModalProps {
  task: any;
  users: any[];
  onClose: () => void;
  onAssign: (task: any) => void; 
  report: any; 
  loading?: boolean;
  error?: string | null;
}

const AutoAssignModal: React.FC<AutoAssignModalProps> = ({ task, onClose, onAssign, report, loading, error }) => {

  useEffect(() => {
    if (!report && !loading) {
      onAssign(task);
    }
  }, [report, loading, onAssign, task]);

  return (
    <div className="modal d-block" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content p-3">
          <h5>Affectation automatique de "{task.nom}"</h5>

          {loading && (
            <div className="d-flex flex-column align-items-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-muted mb-0">
                Analyse de la tâche par l'IA...
              </p>
            </div>
          )}
          {error && <div className="text-danger">{error}</div>}

          {report && (
            <ul className="list-group my-3">
              {report.assigned?.map((u: any, idx: number) => (
                <li key={idx} className="list-group-item">{u.firstName} {u.lastName} ({u.specialite})</li>
              ))}
              {!report.assigned?.length && <li className="list-group-item">Aucune affectation proposée</li>}
            </ul>
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoAssignModal;
