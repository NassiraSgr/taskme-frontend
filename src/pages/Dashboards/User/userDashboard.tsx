import React, { useEffect, useState } from 'react';
import { 
  Briefcase, Clock, Check, Calendar, XCircle, 
  MessageSquare, Search, Filter, ChevronLeft, 
  ChevronRight, UserCheck, UserX, AlertCircle,
  Send, X, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css'; // Import du fichier CSS
import Loader from '../../../components/Loader/Loader';

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

const StatCard = ({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) => (
  <div className={`stat-card ${bgColor}`}>
    <div className={`stat-icon ${color}`}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

const UserDashboard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'refuse' | 'delegate' | null>(null);
  const [justification, setJustification] = useState('');
  const [delegatedTo, setDelegatedTo] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const tasksPerPage = 4;

  // Fetch unread messages
  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat/unread', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Impossible de récupérer les messages non lus');
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
      setUnreadCount(0);
    }
  };

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
      
      const tasks: Task[] = data.affectations.map((a: any) => ({
        _id: a._id,
        taskId: a.task._id,
        nom: a.task.nom,
        type: a.task.type,
        direction: a.task.direction || '',
        dateDebut: a.task.dateDebut,
        remuneree: a.task.remuneree,
        status: a.statut,
        delegatedTo: a.auditeurPropose ? a.auditeurPropose._id : null,
        delegatedFrom: a.auditeurInitial || null,
        delegationStatus: a.confirmationDelegation,
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
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.data.filter((u: User) => u.role === 'AUDITEUR'));
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  useEffect(() => {
    fetchUserTasks();
    fetchUsers();
    fetchUnreadMessages();

    const interval = setInterval(() => {
      fetchUserTasks();
      fetchUnreadMessages();
    }, 15000);
    
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
      if (!justification.trim()) {
        alert('La justification est obligatoire pour refuser une tâche');
        return;
      }
      body.justification = justification;
    }

    if (responseType === 'delegate') {
      if (!delegatedTo) {
        alert('Veuillez sélectionner un auditeur à qui déléguer');
        return;
      }
      body.delegatedTo = delegatedTo;
    }

    try {
      const res = await fetch('http://localhost:3000/api/affectation/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

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

  // Filter and search tasks
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

  const getStatusBadge = (status: string) => {
    const badges = {
      en_attente: { class: 'bg-warning-light text-warning', label: 'En attente' },
      accepte: { class: 'bg-success-light text-success', label: 'Acceptée' },
      refuse: { class: 'bg-danger-light text-danger', label: 'Refusée' },
      delegue: { class: 'bg-info-light text-info', label: 'Déléguée' }
    };
    return badges[status as keyof typeof badges] || badges.en_attente;
  };

  const getDelegationStatusBadge = (status: string | null) => {
    const badges = {
      en_attente: { class: 'bg-warning-light text-warning', label: 'Délégation en attente' },
      acceptee: { class: 'bg-success-light text-success', label: 'Délégation acceptée' },
      refusee: { class: 'bg-danger-light text-danger', label: 'Délégation refusée' }
    };
    return badges[status as keyof typeof badges] || null;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Tableau de bord</h1>
            <p className="welcome-date">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          <button className="btn-calendar">
            <Calendar size={18} />
            <span>Calendrier</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard 
          icon={<Briefcase />} 
          label="Tâches totales" 
          value={userTasks.length} 
          color="primary"
          bgColor="primary-light"
        />
        <StatCard 
          icon={<Clock />} 
          label="En attente" 
          value={userTasks.filter(t => t.status === 'en_attente').length} 
          color="warning"
          bgColor="warning-light"
        />
        <StatCard 
          icon={<Check />} 
          label="Acceptées" 
          value={userTasks.filter(t => t.status === 'accepte').length} 
          color="success"
          bgColor="success-light"
        />
        <StatCard 
          icon={<XCircle />} 
          label="Refusées" 
          value={userTasks.filter(t => t.status === 'refuse').length} 
          color="danger"
          bgColor="danger-light"
        />
        
        {/* Chat Card */}
        <div 
          className="chat-card"
          onClick={() => navigate("/chat/direct")}
        >
          <div className="chat-content">
            <div className="chat-icon-wrapper">
              <MessageSquare size={24} />
              {unreadCount > 0 && (
                <span className="unread-badge">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="chat-text">
              <h4>Messagerie</h4>
              <p>Consulter vos discussions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Vos tâches</h2>
          
          <div className="filters-wrapper">
            {/* Filter buttons */}
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Toutes
              </button>
              <button 
                className={`filter-btn pending ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                En attente
              </button>
              <button 
                className={`filter-btn accepted ${filter === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilter('accepted')}
              >
                Acceptées
              </button>
              <button 
                className={`filter-btn refused ${filter === 'refused' ? 'active' : ''}`}
                onClick={() => setFilter('refused')}
              >
                Refusées
              </button>
            </div>

            {/* Search bar */}
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher une tâche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tasks list */}
        <div className="tasks-list">
          {loading ? (
            <Loader/>
          ) : paginatedTasks.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>Aucune tâche trouvée</p>
            </div>
          ) : (
            paginatedTasks.map((task) => {
              const statusBadge = getStatusBadge(task.status);
              const delegationBadge = task.status === 'delegue' ? 
                getDelegationStatusBadge(task.delegationStatus || null) : null;
              
              return (
                <div key={task._id} className="task-card">
                  <div className="task-main">
                    <div className="task-info">
                      <h3 className="task-title">{task.nom}</h3>
                      <div className="task-meta">
                        <span className="task-type">{task.type}</span>
                        {task.direction && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="task-direction">{task.direction}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="task-right">
                      {task.dateDebut && (
                        <div className="task-date">
                          <Calendar size={14} />
                          <span>{new Date(task.dateDebut).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}

                      <span className={`remuneration-badge ${task.remuneree ? 'remunerate' : 'non-remunerate'}`}>
                        {task.remuneree ? 'Rémunérée' : 'Non rémunérée'}
                      </span>

                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>

                      {delegationBadge && (
                        <span className={`status-badge ${delegationBadge.class}`}>
                          {delegationBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    {/* Délégation en attente pour l'utilisateur cible */}
                    {task.status === 'delegue' && task.delegatedTo === userId && task.delegationStatus === 'en_attente' && (
                      <div className="action-buttons">
                        <button
                          className="btn-action accept"
                          onClick={() => openResponseModal(task, 'accept')}
                        >
                          <UserCheck size={16} />
                          Accepter la délégation
                        </button>
                        <button
                          className="btn-action reject"
                          onClick={() => openResponseModal(task, 'refuse')}
                        >
                          <UserX size={16} />
                          Refuser la délégation
                        </button>
                      </div>
                    )}

                    {/* Tâche en attente pour l'utilisateur assigné */}
                    {task.assignedTo === userId && task.delegatedTo !== userId && task.status === 'en_attente' && (
                      <div className="action-buttons">
                        <button
                          className="btn-action accept"
                          onClick={() => openResponseModal(task, 'accept')}
                        >
                          <Check size={16} />
                          Accepter
                        </button>
                        <button
                          className="btn-action reject"
                          onClick={() => openResponseModal(task, 'refuse')}
                        >
                          <X size={16} />
                          Refuser
                        </button>
                        {task.delegationStatus !== 'refusee' && (
                          <button
                            className="btn-action delegate"
                            onClick={() => openResponseModal(task, 'delegate')}
                          >
                            <Send size={16} />
                            Déléguer
                          </button>
                        )}
                      </div>
                    )}

                    {/* Chat pour les tâches acceptées */}
                    {task.status === 'accepte' && (
                      <button
                        className="btn-action chat"
                        onClick={() => navigate(`/chat/task/${task.taskId}`)}
                      >
                        <MessageSquare size={16} />
                        Discussion
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={18} />
                Précédent
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Répondre à la tâche</h3>
              <button 
                className="modal-close"
                onClick={() => setShowResponseModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-task-title">
                <strong>{selectedTask.nom}</strong>
              </p>

              {responseType === 'refuse' && (
                <div className="form-group">
                  <label className="form-label">
                    Justification du refus <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Expliquez les raisons de votre refus..."
                    rows={4}
                  />
                </div>
              )}

              {responseType === 'delegate' && (
                <div className="form-group">
                  <label className="form-label">
                    Choisir un auditeur <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={delegatedTo}
                    onChange={(e) => setDelegatedTo(e.target.value)}
                  >
                    <option value="">Sélectionner un auditeur</option>
                    {users
                      .filter((u) => u._id !== selectedTask.assignedTo && u._id !== userId)
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {responseType === 'accept' && (
                <p className="accept-message">
                  Êtes-vous sûr de vouloir accepter cette tâche ?
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowResponseModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn-submit"
                onClick={submitResponse}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;