import React, { useEffect, useState } from "react";
import { Briefcase, Clock, Check, DollarSign, BarChart3, Calendar, Users, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ManualAssignModal from "../affectationModals/manuelAffectation";
import AutoAssignModal from "../affectationModals/autoAssign";
import SemiAutoModal from "../affectationModals/semiAuto";
import { useNavigate } from "react-router-dom";



const Dashboard = ({ user, userRole }: { user: any, userRole: string }) => 
{
  const navigate = useNavigate()
  const [lastTasks, setLastTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [affectation, setAffectation] = useState<any[]>([]);
  const [enattente, setEnattente] = useState<any[]>([]);
  const [specialite, setSpecialite] = useState<any[]>([]);
  const [tasksByAuditeur, setTasksByAuditeur] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState<number>(0);

  // pour Pagination 
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tasksPerPage = 5; // nombre de tâches par page


  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [assignmentMethod, setAssignmentMethod] = useState<'manuel' | 'semi_auto' | 'auto'>('manuel');
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [errorAssign, setErrorAssign] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSemiAutoModal, setShowSemiAutoModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [affectations, setAffectations] = useState<any[]>([])
  const [totalAffectation, setTotalAffectation] = useState(1)

 

   const handleAIAssignment = async (task: any) => {
  try {
    setLoadingAssign(true);
    setErrorAssign(null);

    // Envoi du taskId attendu par le backend
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/affectation/auto', {
      method: 'POST',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task._id }) 
    });

    if (!res.ok) throw new Error(`Erreur backend: ${res.status}`);
    const data = await res.json();

    // traitement du résultat IA
    const text = data.content?.map((i: any) => i.text).join('\n') || '';
    const cleanText = text.replace(/```json|```/g, '').trim();
    let parsedData;
    try { parsedData = JSON.parse(cleanText) } catch { parsedData = { raw: cleanText } }
    setAiReport(parsedData);

  } catch (err: any) {
    setErrorAssign(err.message);
  } finally {
    setLoadingAssign(false);
  }
};
  const getAllAffectations = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/affectations',{
      credentials:'include',
      headers:{'Content-Type':'application/json'}
    })
    if(!res) return
    const data = await res.json()
    console.log(data);
    setAffectations(data.data)
    setTotalAffectation(data.total)
    console.log(affectations);
    
  }

  const tasks = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/tasks',{
      credentials:'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    const sortedTasks = data.date.sort((a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

    setLastTasks(sortedTasks);

    const hours = data.date.reduce((acc: number, t: any) => {
      const start = new Date(t.dateDebut);
      const end = new Date(t.dateFin);
      return acc + ((end.getTime() - start.getTime()) / 1000 / 60 / 60);
    }, 0);
    setTotalHours(Math.round(hours * 100) / 100);
  };

  const getUsers = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users',{
      credentials:'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.data);
  };

  const getAffectation = async () => {
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/tasks/affectation', { 
      headers:{'Content-Type' : 'application/json'},
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
    const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users/distribution', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setSpecialite(data);
  };

  useEffect(() => {
    tasks();
    getUsers();
    getAffectation();
    getSpecialiteDistribution();
    getAllAffectations()
  }, []);

  
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
      try { data = JSON.parse(text) } catch { data = { message: text } }

      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'affectation');
      alert('Tâche affectée avec succès !');
      setSelectedTask(null);
      setAiReport(null);
      setShowManualModal(false);
      setShowSemiAutoModal(false);
      setShowAutoModal(false);
      getAffectation();
    } catch (err: any) {
      setErrorAssign(err.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  //pour determiner le statut de  la tache
  const computeTaskStatut = (task: any) => {
      const now = new Date();
      const start = new Date(task.dateDebut);
      const end = new Date(task.dateFin);

      if (now < start) return "PLANIFIEE";
      if (now >= start && now <= end) return "EN_COURS";
      return "TERMINEE";
};

  

  //pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = lastTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(lastTasks.length / tasksPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

  
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Tableau de bord de  {userRole==='COORDINATEUR' ? 'Coordinateur' : userRole==='SUPER_ADMIN' ? 'Admin' : '' }</h2>
          <p className="text-muted">{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2">
          <Calendar size={18} /> Calendrier
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <StatCard icon={<Briefcase />} label="Total Tâches" value={lastTasks.length} color="primary" />
        <StatCard icon={<Clock />} label="En attente" value={enattente.length} color="warning" />
        {affectations.length>0 && <>
          <Link to={'/affectations'}><StatCard icon={<Check />} label="Assignées" value={totalAffectation ?? 0} color="success" /></Link>
        </>}
        <StatCard icon={<DollarSign />} label="Rémunérées" value={lastTasks.filter(t => t.remuneree).length} color="info" />
        <StatCard icon={<DollarSign />} label="Non rémunérées" value={lastTasks.filter(t => !t.remuneree).length} color="secondary" />
        <StatCard icon={<Clock />} label="Volume horaire (h)" value={totalHours} color="purple" />
        <Link to="/userManagement">
          <StatCard icon={<Users />} label="Utilisateurs" value={users.filter(u => Boolean(u.actif) && u.role==='AUDITEUR').length} color="dark" />
        </Link>
      </div>

      {/* Graphiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="card-title d-flex align-items-center gap-2">
              <BarChart3 size={18} /> Répartition par spécialité d'utilisateur
            </h5>
            {specialite.map((s) => (
              <div key={s.label} className="mb-3">
                <div className="d-flex justify-content-between">
                  <small>{s.label}</small>
                  <small>{s.value}%</small>
                </div>
                <div className="progress">
                  <div className={`progress-bar bg-${s.color}`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <h5 className="card-title">Répartition des tâches par auditeur</h5>
            <PieChart width={300} height={250}>
              <Pie data={tasksByAuditeur} dataKey="count" nameKey="user" outerRadius={80} label>
                {/* affiche  les repartition si le coordinateur affecte une tache a un auditeur  */}
                {tasksByAuditeur.filter(u => (u.role !=='SUPER_ADMIN' && u.role !== 'COORDINATEUR'  )).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Tâches récentes avec pagination */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title">Tâches récentes</h5>
          {currentTasks.map(task => {
           const statut = computeTaskStatut(task);
          return (
            <div key={task._id} className="d-flex justify-content-between align-items-start border rounded p-3 mb-2 flex-column flex-md-row">
              <div>
                <strong>{task.title ?? task.nom}</strong>
                <div className="text-muted small">{task.type} {task.direction ? `• ${task.direction}` : ''}</div>
              </div>
              <small className="text-muted">{task.dateDebut.split("T")[0]}</small>
              <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
                <span className={`badge ${
                  statut === "PLANIFIEE"
                    ? "bg-secondary"
                    : statut === "EN_COURS"
                    ? "bg-info"
                    : "bg-success"
                }`}>
                  {statut === "PLANIFIEE"
                    ? "Planifiée"
                    : statut === "EN_COURS"
                    ? "En cours"
                    : "Terminée"}
                </span>

              {
                userRole ==='COORDINATEUR' && 
                (
                  <button
                  className="btn btn-sm btn-primary ms-2"
                  onClick={() => { setSelectedTask(task); setShowAssignModal(true); setAiReport(null); }}
                >
                  Affecter
                </button>
                )
              }
                
                <button
                onClick={() => navigate(`/chat/task/${task._id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  backgroundColor: "#0d6efd", 
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#0b5ed7"; // hover bleu plus foncé
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#0d6efd";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <MessageSquare size={16} /> Chat
              </button>

              </div>
            </div>
          );
        })}


          {/* Pagination controls */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button
              className="btn btn-sm btn-secondary"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              Précédent
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`btn btn-sm ${currentPage === idx + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => paginate(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="btn btn-sm btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {showAssignModal && selectedTask && (
        <div className="modal d-block" onClick={() => setShowAssignModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content p-3">
              <h5>Choisir le mode d'affectation pour "{selectedTask.nom}"</h5>
              <div className="d-flex flex-column gap-2 mt-2">
                <button className="px-4 py-2 border border-slate-500 text-slate-700 rounded-lg hover:bg-slate-600 hover:text-white" onClick={() => { setAssignmentMethod('manuel'); setShowAssignModal(false); setShowManualModal(true); }}>Manuel</button>
                <button className="px-4 py-2 border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-600 hover:text-white" onClick={() => { setAssignmentMethod('semi_auto'); setShowAssignModal(false); setShowSemiAutoModal(true); }}>semi_auto</button>
                <button className="px-4 py-2 border border-violet-600 text-violet-700 rounded-lg hover:bg-violet-600 hover:text-white" onClick={() => { setAssignmentMethod('auto'); setShowAssignModal(false); setShowAutoModal(true); }}>Automatique</button>
              </div>
              <button className="btn btn-secondary mt-3" onClick={() => setShowAssignModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Manuel --- */}
      {showManualModal && selectedTask && userRole==='COORDINATEUR' &&(
        <ManualAssignModal task={selectedTask} users={users} onClose={() => setShowManualModal(false)} onAssign={createAffectation} loading={loadingAssign} error={errorAssign} />
      )}

      {/* --- semi_automatse --- */}
      {showSemiAutoModal && selectedTask && userRole==='COORDINATEUR'   &&  (
        <SemiAutoModal task={selectedTask} users={users} onClose={() => setShowSemiAutoModal(false)} onAssign={createAffectation} loading={loadingAssign} error={errorAssign} />
      )}

      {/* --- Automatise --- */}
      {showAutoModal && selectedTask && userRole==='COORDINATEUR'  && (
        <AutoAssignModal task={selectedTask} users={users} onClose={() => setShowAutoModal(false)} onAssign={handleAIAssignment} report={aiReport} loading={loadingAssign} error={errorAssign} />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
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


export default Dashboard;
