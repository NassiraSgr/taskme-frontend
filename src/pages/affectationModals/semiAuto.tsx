import React from "react";

interface SemiAutoModalProps {
  task: any;
  users: any[];
  onClose: () => void;
  onAssign: (taskId: string, userId: string, mode: 'semi_auto') => void;
  loading?: boolean;
  error?: string | null;
}

const SemiAutoModal: React.FC<SemiAutoModalProps> = ({ task, users, onClose, onAssign, loading, error }) => {
  // Recommandations semi_auto : filtrer par spécialité
  const recommendations = users.filter(u => (task.specialites ?? []).includes(u.specialite))
                               .slice(0, task.nombrePlaces ?? 0);

  return (
    <div className="modal d-block" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content p-3">
          <h5>Affectation semi-automatique de "{task.nom}"</h5>
          {recommendations.length === 0 ? (
            <p>Aucune recommandation disponible pour ce task.</p>
          ) : (
            <ul className="list-group my-3">
              {recommendations.map(u => (
                <li key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
                  {u.firstName} {u.lastName} ({u.specialite})
                  <button className="btn btn-sm btn-primary" onClick={() => onAssign(task._id, u._id, 'semi_auto')} disabled={loading}>
                    {loading ? "Affectation..." : "Affecter"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <div className="text-danger mb-2">{error}</div>}
          <button className="btn btn-secondary mt-2" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default SemiAutoModal;
