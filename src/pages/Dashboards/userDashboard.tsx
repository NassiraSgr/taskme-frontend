import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Check, Calendar, XCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  _id: string;
  taskId: string;
  nom?: string;
  type?: string;
  direction?: string;
  dateDebut?: string;
  remuneree?: boolean;
  status: 'en_attente' | 'accepte' | 'refuse' | 'delegue';
  delegatedTo?: string | null;
  delegatedFrom?: string | null;
  delegationStatus?: 'en_attente' | 'acceptee' | 'refusee' | null;
  assignedTo?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const UserDashboard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const tasksPerPage = 4;

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'refuse' | 'delegate' | null>(null);
  const [justification, setJustification] = useState('');
  const [delegatedTo, setDelegatedTo] = useState('');

  // Fetch tasks
  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/affectations/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Impossible de récupérer les tâches');
      const data = await res.json();
      console.log(data);
      
      const tasks: Task[] = data.affectations.map((a: any) => ({
        _id: a._id,
        taskId: a.task._id,
        nom: a.task.nom,
        type: a.task.type,
        direction: a.task.direction || '',
        dateDebut: a.task.dateDebut,
        remuneree: a.task.remuneree,
        status: a.statut,
        delegatedTo: a.auditeurPropose ? a.auditeurPropose._id :null,
        delegatedFrom: a.auditeurInitial || null,
        delegationStatus: a.confirmationDelegation ,
        assignedTo: a.auditeur?._id,
      }));

      setUserTasks(tasks);
    } catch (err) {
      console.error(err);
      setUserTasks([]);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.data.filter((u: User) => u.role === 'AUDITEUR'));
  };

  useEffect(() => {
    fetchUserTasks();
    fetchUsers();
    const interval = setInterval(fetchUserTasks, 15000);
    return () => clearInterval(interval);
  }, []);

  const openResponseModal = (task: Task, type: 'accept' | 'refuse' | 'delegate') => {
    setSelectedTask(task);
    setResponseType(type);
    setJustification('');
    setDelegatedTo('');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedTask || !responseType) return;

    const body: any = { affectationId: selectedTask._id, status: responseType };

    if (responseType === 'refuse') {
      if (!justification.trim()) return alert('La justification est obligatoire');
      body.justification = justification;
    }

    if (responseType === 'delegate') {
      if (!delegatedTo) return alert('Choisissez un auditeur');
      body.delegatedTo = delegatedTo;
    }

    try {
      const res = await fetch('http://localhost:3000/api/affectation/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      //if (!res.ok) throw new Error('Erreur lors de la réponse à la tâche');
      
      if (!res.ok) {
        const msg = await res.text();
        console.error("Backend error:", msg);
        throw new Error('Erreur lors de la réponse à la tâche');
      }
      await res.json();
      setShowResponseModal(false);
      fetchUserTasks();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredTasks = userTasks.filter((t) => {
    if (filter === 'pending') return t.status === 'en_attente';
    if (filter === 'accepted') return t.status === 'accepte';
    if (filter === 'refused') return t.status === 'refuse';
    return true;
  });

  const searchedTasks = filteredTasks.filter((t) =>
    t.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(searchedTasks.length / tasksPerPage);
  const paginatedTasks = searchedTasks.slice(
    (page - 1) * tasksPerPage,
    page * tasksPerPage
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (page >= totalPages - 2)
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Bienvenue sur votre tableau de bord</h2>
          <p className="text-muted">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2" type="button">
          <Calendar size={18} /> Calendrier
        </button>
      </div>

      {/* STATISTICS */}
      <div className="row g-3 mb-4">
        <StatCard icon={<Briefcase />} label="Tâches totales" value={userTasks.length} color="primary" />
        <StatCard icon={<Clock />} label="Tâches en attente" value={userTasks.filter(t => t.status === 'en_attente').length} color="warning" />
        <StatCard icon={<Check />} label="Tâches acceptées" value={userTasks.filter(t => t.status === 'accepte').length} color="success" />
        <StatCard icon={<XCircle />} label="Tâches refusées" value={userTasks.filter(t => t.status === 'refuse').length} color="danger" />
      </div>

      {/* TASK LIST */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Vos tâches</h5>

          {loading && <p className="text-muted">Chargement…</p>}

          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-outline-primary" type="button" onClick={() => setFilter('all')}>Toutes</button>
            <button className="btn btn-outline-warning" type="button" onClick={() => setFilter('pending')}>En attente</button>
            <button className="btn btn-outline-success" type="button" onClick={() => setFilter('accepted')}>Acceptées</button>
            <button className="btn btn-outline-danger" type="button" onClick={() => setFilter('refused')}>Refusées</button>
          </div>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Rechercher une tâche…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {!loading && paginatedTasks.length === 0 && (
            <p className="text-muted">Aucune tâche trouvée.</p>
          )}

          {paginatedTasks.map((task) => (
            <div
              key={task._id}
              className="d-flex justify-content-between align-items-center border rounded p-3 mb-2"
            >
              <div>
                <strong>{task.nom}</strong>
                <div className="text-muted small">
                  {task.type} {task.direction ? '• ' + task.direction : ''}
                </div>
              </div>

              <small className="text-muted">
                {task.dateDebut ? new Date(task.dateDebut).toLocaleDateString('fr-FR') : ''}
              </small>

              <div className="d-flex gap-2 align-items-center">
                <span className="badge rounded-1 px-2 py-1 bg-body text-secondary border">
                  {task.remuneree ? 'Rémunérée' : 'Non rémunérée'}
                </span>

                {task.status === 'delegue' && task.delegatedTo !== userId && (
                  <span
                    className={`badge rounded-1 px-2 py-1 border ${
                      task.delegationStatus === 'en_attente'
                        ? 'bg-body text-secondary'
                        : task.delegationStatus === 'acceptee'
                        ? 'bg-primary-subtle text-primary'
                        : 'bg-body text-muted'
                    }`}
                  >
                   
                    {task.delegationStatus === 'en_attente'
                      ? 'Délégation en attente'
                      : task.delegationStatus === 'acceptee'
                      ? 'Délégation acceptée'
                      : 'Délégation refusée'}
                  </span>
                )}
               
                {task.status === 'delegue' && task.delegatedTo === userId && task.delegationStatus === 'en_attente' && (
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => openResponseModal(task, 'accept')}
                      >
                        Accepter la délégation
                      </button>

                      <button
                        className="btn btn-sm btn-outline-secondary"
                        type="button"
                        onClick={() => openResponseModal(task, 'refuse')}
                      >
                        Refuser la délégation
                      </button>
                    </div>
                  )}


                {task.assignedTo === userId && task.delegatedTo !== userId && task.status === 'en_attente' && (
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => openResponseModal(task, 'accept')}
                    >
                      Accepter
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() => openResponseModal(task, 'refuse')}
                    >
                      Refuser
                    </button>
                    {task.delegationStatus!=='refusee' && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          onClick={() => openResponseModal(task, 'delegate')}>
                            Déléguer
                        </button>
                    )}
                    
                  </div>
                )}
                
                {task.status === 'accepte' && (
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    type="button"
                    onClick={() => navigate(`/chat/task/${task.taskId}`)}
                  >
                    <MessageSquare size={14} /> Chat
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="d-flex justify-content-center gap-1 mt-3 flex-wrap">
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </button>

            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={idx} className="btn btn-sm btn-outline-secondary disabled">…</span>
              ) : (
                <button
                  key={idx}
                  className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-primary'}`}
                  type="button"
                  onClick={() => setPage(Number(p))}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-sm btn-secondary"
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* MODAL RÉPONSE */}
      {showResponseModal && selectedTask && (
        <div className="modal d-block" onClick={() => setShowResponseModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-3">
              <h5>Répondre à "{selectedTask.nom}"</h5>

              {responseType === 'refuse' && (
                <>
                  <label>Justification du refus (obligatoire)</label>
                  <textarea
                    className="form-control"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </>
              )}

              {responseType === 'delegate' && (
                <>
                  <label>Choisir un auditeur</label>
                  <select
                    className="form-control"
                    value={delegatedTo}
                    onChange={(e) => setDelegatedTo(e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {users
                      .filter((u) => u._id !== selectedTask.assignedTo && u._id !== userId)
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                  </select>
                </>
              )}

              <button className="btn btn-primary mt-3" type="button" onClick={submitResponse}>
                Valider
              </button>
              <button
                className="btn btn-secondary mt-3 ms-2"
                type="button"
                onClick={() => setShowResponseModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat card
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="col">
    <div className={`card shadow-sm text-center h-100 text-${color}`}>
      <div className="card-body">
        <div className="mb-2">{icon}</div>
        <h4>{value}</h4>
        <small className="text-muted">{label}</small>
      </div>
    </div>
  </div>
);

export default UserDashboard;
