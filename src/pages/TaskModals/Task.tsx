import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Calendar, 
  FileText, 
  Users, 
  MapPin, 
  DollarSign, 
  Car, 
  Building, 
  Award,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  Tag,
  User,
  Award as GradeIcon,
  File,
  Globe
} from "lucide-react";

interface TaskModel {
  _id: string;
  nom: string;
  description: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  remuneree: boolean;
  prixRemuneree?: number;
  vehiculeRequis: boolean;
  ligne: string;
  ville: string;
  commune: boolean;
  specialites: string[];
  grades: string[];
  nombrePlaces: number;
  adminFile?: string;
  affectations?: any[];
}

const allTypes = ["FORMATEUR", "MEMBRE_JURY", "BENEFICIAIRE", "OBSERVATEUR", "CONCEPTEUR_EVALUATION"];

const Task = ({ userRole, userId }: { userRole: string, userId: string }) => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskModel | null>(null);
  const [userAffectation, setUserAffectation] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const [editedData, setEditedData] = useState<TaskModel>({
    _id: "",
    nom: "",
    description: "",
    type: "",
    dateDebut: "",
    dateFin: "",
    remuneree: false,
    prixRemuneree: 0,
    specialites: [],
    grades: [],
    vehiculeRequis: false,
    ligne: "",
    ville: '',
    commune: false,
    nombrePlaces: 0,
  });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${id}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        showMessage("Impossible de charger cette tâche", 'error');
        return;
      }
      const data = await res.json();
      setTask(data.data);

      setEditedData({
        ...data.data,
        dateDebut: data.data.dateDebut?.split("T")[0] || "",
        dateFin: data.data.dateFin?.split("T")[0] || "",
      });

      const affect = data.data.affectations?.find((a: any) => a.auditeur === userId);
      setUserAffectation(affect);
    } catch (err) {
      console.error(err);
      showMessage("Impossible de charger cette tâche", 'error');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleChange = (field: string, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      
      const data = await res.json();
      setTask(data.data);
      setShowEditModal(false);
      showMessage('✓ Tâche modifiée avec succès', 'success');
    } catch (err) {
      console.error(err);
      showMessage('✗ Erreur lors de la modification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAffectation = async (statut: string) => {
    if (!userAffectation) return;
    
    if (statut === "refuse") {
      const justification = prompt("Raison du refus :") || "";
      if (!justification.trim()) {
        showMessage("Veuillez fournir une raison pour le refus", 'error');
        return;
      }
    }

    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/affectations/${userAffectation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, justification: statut === "refuse" ? prompt("Raison du refus") || "" : "" }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');

      setUserAffectation((prev: any) => ({ ...prev, statut }));
      showMessage(`✓ Tâche ${statut === "accepte" ? "acceptée" : "refusée"}`, 'success');
    } catch (err) {
      console.error(err);
      showMessage('✗ Erreur lors de la mise à jour', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'FORMATEUR':
        return <Users className={iconClass} />;
      case 'MEMBRE_JURY':
        return <Award className={iconClass} />;
      case 'BENEFICIAIRE':
        return <User className={iconClass} />;
      case 'CONCEPTEUR_EVALUATION':
        return <FileText className={iconClass} />;
      default:
        return <Users className={iconClass} />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'accepte':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'refuse':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getDaysRemaining = (dateFin: string) => {
    const endDate = new Date(dateFin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de la tâche...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(task.dateFin);
  const isUrgent = daysRemaining <= 3;

  return (
    <div className="min-h-screen card-body bg-gray-50 dark:bg-gray-900"> 
      {/* Message d'alerte */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-5 ${
          messageType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-500'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <div className="container card-body mx-auto px-4 py-8">
        <div className="mb-8">
          <a 
            href="/tasks" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour aux tâches
          </a>
          
          <div className="flex card-body flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  {getTypeIcon(task.type)}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isUrgent 
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse'
                    : daysRemaining <= 7
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {daysRemaining < 0 
                    ? 'Terminée' 
                    : daysRemaining === 0
                      ? "Aujourd'hui"
                      : `${daysRemaining} jours restants`}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {task.nom}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {task.description}
              </p>
            </div>
            
            {(userRole === "SUPER_ADMIN" || userRole === "COORDINATEUR") && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Modifier
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations principales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Informations principales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type de tâche</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {getTypeIcon(task.type)}
                      <span className="text-gray-900 dark:text-white font-medium">{task.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Période</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-gray-900 dark:text-white">
                        <div className="font-medium">{formatDate(task.dateDebut)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">au</div>
                        <div className="font-medium">{formatDate(task.dateFin)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Rémunération</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-5 h-5 ${task.remuneree ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        <span className={`font-medium ${task.remuneree ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {task.remuneree ? 'Rémunérée' : 'Non rémunérée'}
                        </span>
                      </div>
                      {task.remuneree && task.prixRemuneree && (
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {task.prixRemuneree} MAD
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Places disponibles</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{task.nombrePlaces}</span>
                        <span className="text-gray-600 dark:text-gray-400">places</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spécialités et grades */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Compétences requises
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spécialités</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.specialites.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grades acceptés</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.grades.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2"
                      >
                        <GradeIcon className="w-4 h-4" />
                        Grade {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Logistique
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Véhicule requis</div>
                      <div className={`font-medium ${task.vehiculeRequis ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {task.vehiculeRequis ? 'Oui' : 'Non'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {task.vehiculeRequis && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Ligne</div>
                          <div className="font-medium text-gray-900 dark:text-white">{task.ligne}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Ville</div>
                          <div className="font-medium text-gray-900 dark:text-white">{task.ville}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Commune</div>
                      <div className={`font-medium ${task.commune ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {task.commune ? 'Oui' : 'Non'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {task.adminFile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Documents
                </h2>
                
                <a
                  href={`https://taskme-backend-wt4m.onrender.com/${task.adminFile}`}
                  download
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le fichier
                </a>
                
                {task.adminFile.endsWith('.pdf') && (
                  <div className="mt-4">
                    <iframe
                      src={`https://taskme-backend-wt4m.onrender.com/${task.adminFile}`}
                      className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700"
                      title="Document PDF"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Statut d'affectation */}
            {userAffectation && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  Votre affectation
                </h2>
                
                <div className={`p-4 rounded-lg border ${getStatusColor(userAffectation.statut)}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                      {userAffectation.statut === 'accepte' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : userAffectation.statut === 'refuse' ? (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Statut</div>
                      <div className="text-lg font-bold capitalize">
                        {userAffectation.statut === 'accepte' ? 'Acceptée' : 
                         userAffectation.statut === 'refuse' ? 'Refusée' : 'En attente'}
                      </div>
                    </div>
                  </div>
                  
                  {userAffectation.statut === "en_attente" && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleAffectation("accepte")}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accepter
                      </button>
                      <button 
                        onClick={() => handleAffectation("refuse")}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier la tâche</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de la tâche
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={editedData.nom}
                      onChange={e => handleChange("nom", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-32"
                      value={editedData.description}
                      onChange={e => handleChange("description", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={editedData.type}
                        onChange={e => handleChange("type", e.target.value)}
                      >
                        {allTypes.map(t => (
                          <option key={t} value={t}>{t.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de places
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={editedData.nombrePlaces}
                        onChange={e => handleChange("nombrePlaces", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={editedData.dateDebut}
                        onChange={e => handleChange("dateDebut", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={editedData.dateFin}
                        onChange={e => handleChange("dateFin", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="remuneree"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={editedData.remuneree}
                        onChange={e => handleChange("remuneree", e.target.checked)}
                      />
                      <label htmlFor="remuneree" className="text-gray-700 dark:text-gray-300 font-medium">
                        Tâche rémunérée
                      </label>
                    </div>
                    
                    {editedData.remuneree && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Montant (MAD)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          value={editedData.prixRemuneree}
                          onChange={e => handleChange("prixRemuneree", e.target.valueAsNumber)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="vehicule"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={editedData.vehiculeRequis}
                        onChange={e => handleChange("vehiculeRequis", e.target.checked)}
                      />
                      <label htmlFor="vehicule" className="text-gray-700 dark:text-gray-300 font-medium">
                        Véhicule requis
                      </label>
                    </div>
                    
                    {editedData.vehiculeRequis && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ville
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          value={editedData.ville}
                          onChange={e => handleChange("ville", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;