import React, { useState } from "react";

interface ManualAssignModalProps {
  task: any;
  users: any[];
  onClose: () => void;
  onAssign: (taskId: string, userId: string, mode: 'manuel') => void;
  loading?: boolean;
  error?: string | null;
}

const ManualAssignModal: React.FC<ManualAssignModalProps> = ({ task, users, onClose, onAssign, loading, error }) => {
  const [selectedUser, setSelectedUser] = useState<string>("");

  const handleAssign = () => {
    if (!selectedUser) return alert("Veuillez sélectionner un utilisateur.");
    onAssign(task._id, selectedUser, 'manuel');
  };

  return (
    <div className="modal d-block" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content p-3">
          <h5>Affectation manuelle de "{task.nom}"</h5>
          <select className="form-select my-3" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="">-- Sélectionner un utilisateur --</option>
            {users.filter(u=>(u.role === 'AUDITEUR')).map(u => (
              <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.specialite})</option>
            ))}
          </select>
          {error && <div className="text-danger mb-2">{error}</div>}
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
              {loading ? "Affectation..." : "Affecter"}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAssignModal;
