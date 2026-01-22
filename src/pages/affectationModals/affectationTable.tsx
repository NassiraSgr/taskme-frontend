import React, { useEffect, useState } from "react";
import { Users, Trash2, Edit } from "lucide-react";

type Affectation = {
  _id: string;
  task: { _id: string; title?: string; nom?: string };
  auditeur: { _id: string; firstName: string; lastName: string };
  mode: 'manuel' | 'semi_auto' | 'auto';
  statut : 'en_attente' | 'accepte' | 'refuse' | 'delegue'
};

type User = { _id: string; firstName: string; lastName: string };

const AffectationsTable = () => {
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAuditeurId, setNewAuditeurId] = useState<string>('');
  const [newMode, setNewMode] = useState<'manuel' | 'semi_auto' | 'auto'>('manuel');
  const [statut , setStatut] = useState<'en_attente' | 'accepte' | 'refuse' | 'delegue'>('en_attente')
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const [message, setMessage ] = useState<String>('')

  
  const fetchAffectations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/affectations?page=${page}&limit=${limit}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement des affectations');
      const data = await res.json();
      setAffectations(data.data);
      setTotalPages(data.totalPages)

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data.data.filter((u: any) => u.role === 'AUDITEUR' && u.actif));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAffectations();
  }, [page]);

  // Supprimer une affectation
  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette affectation ?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/affectation/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setAffectations(prev => prev.filter(a => a._id !== id));
      setMessage('Affectation supprimee avec succes.')
    } catch (err) {
      console.error(err);
    }
  };

  
  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/affectation/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditeur: newAuditeurId, mode: newMode , statut : statut })
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      setEditingId(null);
      fetchAffectations(); 
      setMessage('Affectation modifiee avec succes')
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }
}, [message]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="container py-4">
      <h3 className="mb-3">Liste des affectations</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Auditeur</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {affectations.map(a => (
            <tr key={a._id}>
              <td>{ a.task.nom}</td>
              <td>
                {editingId === a._id ? (
                  <select
                    value={newAuditeurId}
                    onChange={e => setNewAuditeurId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Sélectionner</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  `${a.auditeur.firstName} ${a.auditeur.lastName}`
                )}
              </td>
              <td>
                {editingId === a._id ? (
                  <select
                    value={newMode}
                    onChange={e => setNewMode(e.target.value as 'manuel' | 'semi_auto' | 'auto')}
                    className="form-select"
                  >
                    <option value="manuel">Manuel</option>
                    <option value="semi_auto">Semi-auto</option>
                    <option value="auto">Automatique</option>
                  </select>
                ) : (
                  a.mode
                )}
              </td>
              <td>
                {editingId === a._id ? (
                  <select
                    value={statut}
                    onChange={e => setStatut(e.target.value as 'en_attente' | 'accepte' | 'refuse' | 'delegue')}
                    className="form-select"
                  >
                    <option value="accepte">Accepte</option>
                    <option value="refuse">Refuse</option>
                    <option value="en_attente">En attente</option>
                  </select>
                ) : (
                  a.statut
                )}

              </td>
              <td className="d-flex gap-2">
                {editingId === a._id ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => handleEdit(a._id)}>Enregistrer</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Annuler</button>
                    
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => { setEditingId(a._id); setNewAuditeurId(a.auditeur._id); setNewMode(a.mode); }}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a._id)}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          
          
        </tbody>
      </table>
      {affectations.length === 0 && (
              <p  className="text-center">Aucune affectation disponible</p>
          )}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          className="px-3 py-1 border"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>

        <span className="px-3 py-1 border bg-gray-100">
          Page {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 border"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
        
      </div>
      {message && <><div className="alert alert-success mt-2 text-center">{message}</div></>}
    </div>
  );
};

export default AffectationsTable;
