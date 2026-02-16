import React, { useEffect, useState } from "react";
import { 
  Briefcase, Clock, Check, DollarSign, BarChart3, Calendar, 
  Users, MessageSquare, TrendingUp, AlertCircle, Filter,
  Download, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import ManualAssignModal from "../affectationModals/manuelAffectation";
import AutoAssignModal from "../affectationModals/autoAssign";
import SemiAutoModal from "../affectationModals/semiAuto";


interface Task {
  _id: string;
  title?: string;
  nom?: string;
  type: string;
  ville?: string;
  dateDebut: string;
  dateFin: string;
  volumeHoraire: number;
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';
  remuneree: boolean;
  nombrePlaces: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  actif: boolean;
}

interface Affectation {
  _id: string;
  task?: { _id: string };
  auditeur: { _id: string };
  statut: string;
  confirmationDelegation?: string;
}

const Dashboard = ({ user, userRole }: { user: any; userRole: string }) => {
  const navigate = useNavigate();
  
  // États
  const [lastTasks, setLastTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [affectation, setAffectation] = useState<Affectation[]>([]);
  const [enattente, setEnattente] = useState<any[]>([]);
  const [specialite, setSpecialite] = useState<any[]>([]);
  const [tasksByAuditeur, setTasksByAuditeur] = useState<any[]>([]);
  const [affectations, setAffectations] = useState<any[]>([]);
  const [totalAffectation, setTotalAffectation] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;
  
  // Modals & Assignment
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [errorAssign, setErrorAssign] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSemiAutoModal, setShowSemiAutoModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  
  // Loading & Filters
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // API Calls
  const handleAIAssignment = async (task: Task) => {
    try {
      setLoadingAssign(true);
      setErrorAssign(null);

      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/affectation/auto', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task._id })
      });

      if (!res.ok) throw new Error(`Erreur backend: ${res.status}`);
      const data = await res.json();

      const text = data.content?.map((i: any) => i.text).join('\n') || '';
      const cleanText = text.replace(/```json|```/g, '').trim();
      let parsedData;
      try {
        parsedData = JSON.parse(cleanText);
      } catch {
        parsedData = { raw: cleanText };
      }
      setAiReport(parsedData);
    } catch (err: any) {
      setErrorAssign(err.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  const getAllAffectations = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/affectations', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return;
    const data = await res.json();
    setAffectations(data.data);
    setTotalAffectation(data.total);
  };

  const tasks = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/tasks', {
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    const tasksWithHours = data.date.map((t: any) => {
      const start = new Date(t.dateDebut);
      const end = new Date(t.dateFin);
      const volumeHoraire = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
      return { ...t, volumeHoraire: Math.round(volumeHoraire * 100) / 100 };
    });

    const sortedTasks = tasksWithHours.sort(
      (a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );

    setLastTasks(sortedTasks);
  };

  const getUsers = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users', {
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.data);
  };

  const getAffectation = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/tasks/affectation', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setAffectation(data.estAffectee);
    setEnattente(data.enAttente);

    const distribution = users
      .filter(u => u.role === 'AUDITEUR' && u.actif)
      .map(u => ({
        user: `${u.firstName} ${u.lastName}`,
        count: data.estAffectee.filter((a: any) => a.auditeur._id === u._id).length
      }));

    setTasksByAuditeur(distribution);
  };

  const getSpecialiteDistribution = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users/distribution', {
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setSpecialite(data);
  };

  const createAffectation = async (taskId: string, userId: string, mode: 'manuel' | 'semi_auto' | 'auto') => {
    try {
      setLoadingAssign(true);
      setErrorAssign(null);
      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/affectation', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, auditeur: userId, mode })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'affectation');
      
      alert('Tâche affectée avec succès !');
      setSelectedTask(null);
      setAiReport(null);
      setShowManualModal(false);
      setShowSemiAutoModal(false);
      setShowAutoModal(false);
      await refreshData();
    } catch (err: any) {
      setErrorAssign(err.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      tasks(),
      getUsers(),
      getAffectation(),
      getSpecialiteDistribution(),
      getAllAffectations()
    ]);
    setRefreshing(false);
  };

  const loadData = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrage des tâches
  const filteredTasks = filterStatus === "ALL" 
    ? lastTasks 
    : lastTasks.filter(t => t.statut === filterStatus);

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Statistiques calculées
  const stats = {
    total: lastTasks.length,
    enAttente: enattente.length,
    assignees: totalAffectation,
    remunerees: lastTasks.filter(t => t.remuneree).length,
    nonRemunerees: lastTasks.filter(t => !t.remuneree).length,
    auditeurs: users.filter(u => Boolean(u.actif) && u.role === 'AUDITEUR').length,
    totalHeures: lastTasks.reduce((sum, t) => sum + t.volumeHoraire, 0)
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const getRoleName = (role: string) => {
    switch(role) {
      case 'COORDINATEUR': return 'Coordinateur';
      case 'SUPER_ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  const getStatusInfo = (statut: string) => {
    switch(statut) {
      case "PLANIFIEE": return { label: "Planifiée", color: "status-planned" };
      case "EN_COURS": return { label: "En cours", color: "status-progress" };
      case "TERMINEE": return { label: "Terminée", color: "status-completed" };
      default: return { label: statut, color: "status-default" };
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="improved-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              Tableau de bord {getRoleName(userRole)}
            </h1>
            <p className="dashboard-date">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-icon-text" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
              Actualiser
            </button>
            <button className="btn-primary">
              <Calendar size={18} />
              Calendrier
            </button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <StatCard 
          icon={<Briefcase />} 
          label="Total Tâches" 
          value={stats.total} 
          color="blue"
          trend="+12%"
        />
        <StatCard 
          icon={<Clock />} 
          label="En attente" 
          value={stats.enAttente} 
          color="orange"
        />
        <Link to="/affectations" className="stat-link">
          <StatCard 
            icon={<Check />} 
            label="Assignées" 
            value={stats.assignees} 
            color="green"
            trend="+8%"
          />
        </Link>
        <StatCard 
          icon={<DollarSign />} 
          label="Rémunérées" 
          value={stats.remunerees} 
          color="purple"
        />
        <StatCard 
          icon={<TrendingUp />} 
          label="Volume horaire" 
          value={`${stats.totalHeures.toFixed(0)}h`} 
          color="indigo"
          isNumeric={false}
        />
        <Link to="/userManagement" className="stat-link">
          <StatCard 
            icon={<Users />} 
            label="Auditeurs actifs" 
            value={stats.auditeurs} 
            color="teal"
          />
        </Link>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        {/* Spécialités Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <BarChart3 size={20} />
              Répartition par spécialité
            </h3>
          </div>
          <div className="chart-content">
            {specialite.map((s) => (
              <div key={s.label} className="specialty-bar">
                <div className="specialty-info">
                  <span className="specialty-label">{s.label}</span>
                  <span className="specialty-value">{s.value}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar-fill color-${s.color}`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Tâches par auditeur</h3>
          </div>
          <div className="chart-content pie-chart-container">
            {tasksByAuditeur.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={tasksByAuditeur}
                    dataKey="count"
                    nameKey="user"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.value}`}
                  >
                    {tasksByAuditeur.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <AlertCircle size={48} />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="tasks-section">
        <div className="tasks-header">
          <div className="tasks-title-group">
            <h3 className="tasks-title">Tâches récentes</h3>
            <span className="tasks-count">{filteredTasks.length} tâche(s)</span>
          </div>
          <div className="tasks-filters">
            <button 
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              Toutes
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'PLANIFIEE' ? 'active' : ''}`}
              onClick={() => setFilterStatus('PLANIFIEE')}
            >
              Planifiées
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'EN_COURS' ? 'active' : ''}`}
              onClick={() => setFilterStatus('EN_COURS')}
            >
              En cours
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'TERMINEE' ? 'active' : ''}`}
              onClick={() => setFilterStatus('TERMINEE')}
            >
              Terminées
            </button>
          </div>
        </div>

        <div className="tasks-list">
          {currentTasks.map((task) => {
            const affectationsValides = affectation.filter(
              a =>
                a.task?._id?.toString() === task._id.toString() &&
                (a.statut === 'accepte' || a.confirmationDelegation === 'acceptee')
            );
            const placesRestantes = task.nombrePlaces - affectationsValides.length;
            const statusInfo = getStatusInfo(task.statut);

            return (
              <div key={task._id} className="task-card">
                <div className="task-main">
                  <div className="task-info">
                    <h4 className="task-name">{task.title ?? task.nom}</h4>
                    <div className="task-meta">
                      <span className="task-type">{task.type}</span>
                      {task.ville && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="task-location">{task.ville}</span>
                        </>
                      )}
                      <span className="meta-separator">•</span>
                      <span className="task-date">
                        {new Date(task.dateDebut).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="meta-separator">•</span>
                      <span className="task-hours">{task.volumeHoraire.toFixed(1)}h</span>
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <span className={`status-badge ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>

                    {userRole === 'COORDINATEUR' && 
                     task.statut !== 'TERMINEE' && 
                     placesRestantes > 0 && (
                      <button
                        className="btn-assign"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowAssignModal(true);
                          setAiReport(null);
                        }}
                      >
                        Affecter
                      </button>
                    )}

                    <button
                      className="btn-chat"
                      onClick={() => navigate(`/chat/task/${task._id}`)}
                    >
                      <MessageSquare size={16} />
                      Chat
                    </button>
                  </div>
                </div>

                {placesRestantes > 0 && task.statut !== 'TERMINEE' && (
                  <div className="task-footer">
                    <div className="places-indicator">
                      <Users size={14} />
                      <span>{placesRestantes} place(s) disponible(s)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {currentTasks.length === 0 && (
            <div className="no-tasks">
              <Briefcase size={48} />
              <p>Aucune tâche trouvée</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`pagination-number ${currentPage === idx + 1 ? 'active' : ''}`}
                  onClick={() => paginate(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Modals */}
      {showAssignModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assignment-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              Choisir le mode d'affectation
            </h3>
            <p className="modal-subtitle">
              Tâche: {selectedTask.nom}
            </p>
            
            <div className="assignment-methods">
              <button
                className="method-btn method-manual"
                onClick={() => {
                  setShowAssignModal(false);
                  setShowManualModal(true);
                }}
              >
                <div className="method-icon">👤</div>
                <div className="method-info">
                  <h4>Manuel</h4>
                  <p>Sélectionner un auditeur manuellement</p>
                </div>
              </button>

              <button
                className="method-btn method-semi"
                onClick={() => {
                  setShowAssignModal(false);
                  setShowSemiAutoModal(true);
                }}
              >
                <div className="method-icon">⚡</div>
                <div className="method-info">
                  <h4>Semi-automatique</h4>
                  <p>Suggestions IA avec validation</p>
                </div>
              </button>

              <button
                className="method-btn method-auto"
                onClick={() => {
                  setShowAssignModal(false);
                  setShowAutoModal(true);
                }}
              >
                <div className="method-icon">🤖</div>
                <div className="method-info">
                  <h4>Automatique</h4>
                  <p>Affectation intelligente par IA</p>
                </div>
              </button>
            </div>

            <button 
              className="btn-secondary modal-close" 
              onClick={() => setShowAssignModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showManualModal && selectedTask && userRole === 'COORDINATEUR' && (
        <ManualAssignModal
          task={selectedTask}
          users={users}
          onClose={() => setShowManualModal(false)}
          onAssign={createAffectation}
          loading={loadingAssign}
          error={errorAssign}
        />
      )}

      {showSemiAutoModal && selectedTask && userRole === 'COORDINATEUR' && (
        <SemiAutoModal
          task={selectedTask}
          users={users}
          onClose={() => setShowSemiAutoModal(false)}
          onAssign={createAffectation}
          loading={loadingAssign}
          error={errorAssign}
        />
      )}

      {showAutoModal && selectedTask && userRole === 'COORDINATEUR' && (
        <AutoAssignModal
          task={selectedTask}
          users={users}
          onClose={() => setShowAutoModal(false)}
          onAssign={handleAIAssignment}
          report={aiReport}
          loading={loadingAssign}
          error={errorAssign}
        />
      )}
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  trend?: string;
  isNumeric?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  color, 
  trend,
  isNumeric = true 
}) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className="stat-trend">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;