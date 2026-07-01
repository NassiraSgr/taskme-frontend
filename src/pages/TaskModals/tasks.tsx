import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  User,
  Tag,
  FileText,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  Plus,
  CheckCircle,
  Download,
  X,
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Award
} from "lucide-react";

interface Task {
  _id: string;
  nom?: string;
  title?: string;
  description?: string;
  dateDebut: string;
  dateFin?: string;
  specialites?: string[];
  grades?: string[];
  auditeurs?: any[];
  statut?: string;
  type?: string;
  remuneree?: boolean;
  prixRemuneree?: number;
  ville?: string;
  nombrePlaces?: number;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSpecialite, setFilterSpecialite] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchUser();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/tasks', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Erreur lors de la récupération des tâches');

      const data = await res.json();
      const tasksData = data.date || data.data || [];
      
      const sortedTasks = tasksData.sort((a: Task, b: Task) => 
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
      );
      
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
      
      if (tasksData.length === 0) {
        showMessage("Aucune tâche trouvée", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("Impossible de charger les tâches", 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/user', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) return;

      const data = await res.json();
      setRole(data.data.role);
      setUser(data.data);
    } catch (err) {
      console.error('Erreur lors de récupération de utilisateur:', err);
    }
  };

  const showMessage = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  useEffect(() => {
    let result = [...tasks];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task =>
        (task.nom || task.title || '').toLowerCase().includes(term) ||
        (task.description || '').toLowerCase().includes(term) ||
        (task.type || '').toLowerCase().includes(term)
      );
    }
    
    if (filterSpecialite) {
      result = result.filter(task =>
        task.specialites?.includes(filterSpecialite)
      );
    }
    
    if (filterStatus !== 'all') {
      const today = new Date();
      result = result.filter(task => {
        if (!task.dateFin) return filterStatus === 'ongoing';
        const endDate = new Date(task.dateFin);
        
        if (filterStatus === 'ongoing') {
          return endDate >= today;
        } else if (filterStatus === 'completed') {
          return endDate < today;
        }
        return true;
      });
    }
    
    result = sortTasks(result, sortBy);
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, filterSpecialite, filterStatus, sortBy]);

  const sortTasks = (tasksList: Task[], sortOption: string) => {
    const sorted = [...tasksList];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
      case 'name_asc':
        return sorted.sort((a, b) => (a.nom || a.title || '').localeCompare(b.nom || b.title || ''));
      case 'name_desc':
        return sorted.sort((a, b) => (b.nom || b.title || '').localeCompare(a.nom || a.title || ''));
      case 'deadline':
        return sorted.sort((a, b) => {
          if (!a.dateFin) return 1;
          if (!b.dateFin) return -1;
          return new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime();
        });
      default:
        return sorted;
    }
  };

  const handleDelete = async (_id: string) => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette tâche ?\n\nCette action est irréversible et supprimera toutes les données associées.")) return;
    
    setDeletingId(_id);
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) throw new Error('Erreur lors de la suppression de la tâche');
      
      const updatedTasks = tasks.filter(task => task._id !== _id);
      setTasks(updatedTasks);
      
      showMessage('✓ Tâche supprimée avec succès', 'success');
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || '✗ Erreur lors de la suppression', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterSpecialite('');
    setFilterStatus('all');
    setSortBy('newest');
  }, []);

  const specialitesList = useMemo(() => {
    const allSpecialites = new Set<string>();
    tasks.forEach(task => {
      if (task.specialites) {
        task.specialites.forEach((s: string) => allSpecialites.add(s));
      }
    });
    return Array.from(allSpecialites);
  }, [tasks]);

  const exportToCSV = useCallback(() => {
    const headers = ["Nom", "Description", "Type", "Spécialités", "Grades", "Date Début", "Date Fin", "Statut", "Places", "Ville"];
    const csvData = filteredTasks.map(task => [
      task.nom || task.title || '',
      (task.description?.substring(0, 100) || '').replace(/,/g, ';'),
      task.type || '',
      task.specialites?.join('; ') || '',
      task.grades?.join('; ') || '',
      new Date(task.dateDebut).toLocaleDateString('fr-FR'),
      task.dateFin ? new Date(task.dateFin).toLocaleDateString('fr-FR') : '',
      task.dateFin && new Date(task.dateFin) < new Date() ? 'Terminée' : 'En cours',
      task.nombrePlaces || '',
      task.ville || ''
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taches_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('✓ Export CSV réussi', 'success');
  }, [filteredTasks, showMessage]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const getDaysRemaining = useCallback((dateFin: string) => {
    if (!dateFin) return null;
    const endDate = new Date(dateFin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    return {
      total: tasks.length,
      ongoing: tasks.filter(t => !t.dateFin || new Date(t.dateFin) >= today).length,
      completed: tasks.filter(t => t.dateFin && new Date(t.dateFin) < today).length,
      specialites: specialitesList.length,
      urgent: tasks.filter(t => {
        if (!t.dateFin) return false;
        const days = getDaysRemaining(t.dateFin);
        return days !== null && days >= 0 && days <= 7;
      }).length
    };
  }, [tasks, specialitesList, getDaysRemaining]);

  const getTaskStatusBadge = (task: Task) => {
    if (!task.dateFin) {
      return <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">En cours</span>;
    }
    
    const daysRemaining = getDaysRemaining(task.dateFin);
    
    if (daysRemaining === null) return null;
    
    if (daysRemaining < 0) {
      return <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700">Terminée</span>;
    } else if (daysRemaining <= 3) {
      return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-medium rounded-full animate-pulse border border-red-200 dark:border-red-800">Urgent</span>;
    } else if (daysRemaining <= 7) {
      return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-full border border-amber-200 dark:border-amber-800">Bientôt</span>;
    } else {
      return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800">Actif</span>;
    }
  };

  const getTypeIcon = (type?: string) => {
    const iconClass = "w-4 h-4 text-blue-600 dark:text-blue-400";
    switch (type) {
      case 'FORMATEUR':
        return <Users className={iconClass} />;
      case 'MEMBRE_JURY':
        return <Award className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Tâches</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Consultez et gérez toutes les tâches du système</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {(role === "SUPER_ADMIN" || role === "COORDINATEUR") && (
                <Link
                  to="/addTask"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle tâche
                </Link>
              )}
              <button
                onClick={exportToCSV}
                disabled={filteredTasks.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">En cours</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-1">{stats.ongoing}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Terminées</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{stats.completed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Urgentes</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-500 mt-1">{stats.urgent}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Spécialités</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-500 mt-1">{stats.specialites}</p>
                </div>
                <Tag className="w-10 h-10 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col gap-4 dark:bg-gray">
            <div className="relative ">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, description, type..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 text-base transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filterSpecialite}
                onChange={(e) => setFilterSpecialite(e.target.value)}
              >
                <option value="">Toutes spécialités</option>
                {specialitesList.map((specialite) => (
                  <option key={specialite} value={specialite}>
                    {specialite}
                  </option>
                ))}
              </select>
              
              <select
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminées</option>
              </select>
              
              <select
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="name_asc">Nom (A-Z)</option>
                <option value="name_desc">Nom (Z-A)</option>
                <option value="deadline">Par échéance</option>
              </select>
              
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Réinitialiser
              </button>
              
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
            
            {(searchTerm || filterSpecialite || filterStatus !== 'all') && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredTasks.length}</span> tâche(s) trouvée(s)
                  {tasks.length > filteredTasks.length && (
                    <span className="ml-2">
                      sur {tasks.length} au total
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm border-l-4 animate-in fade-in slide-in-from-top duration-300 ${
            messageType === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-500 dark:border-emerald-600' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-500 dark:border-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  messageType === 'success' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40' 
                    : 'bg-red-100 dark:bg-red-900/40'
                }`}>
                  {messageType === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <span className="font-medium">{message}</span>
              </div>
              <button 
                onClick={() => setMessage('')}
                className={`p-1.5 rounded-lg transition-colors ${
                  messageType === 'success'
                    ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    : 'hover:bg-red-100 dark:hover:bg-red-900/40'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Liste des tâches */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-16 text-center">
            <RefreshCw className="w-16 h-16 text-blue-500 dark:text-blue-400 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chargement en cours...</h3>
            <p className="text-gray-600 dark:text-gray-400">Récupération des tâches </p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task, index) => {
                const daysRemaining = task.dateFin ? getDaysRemaining(task.dateFin) : null;
                const isDeleting = deletingId === task._id;
                
                return (
                  <div
                    key={task._id}
                    className={`bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 ${
                      isDeleting ? 'opacity-50' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                              {getTypeIcon(task.type)}
                            </div>
                            {getTaskStatusBadge(task)}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">
                            {task.nom || task.title}
                          </h3>
                          {task.type && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {task.type.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                        {(role === "SUPER_ADMIN" || role === "COORDINATEUR") && (
                          <button
                            onClick={() => handleDelete(task._id)}
                            disabled={isDeleting}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{formatDate(task.dateDebut)}</span>
                        {task.dateFin && (
                          <>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{formatDate(task.dateFin)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {(task.specialites && task.specialites.length > 0) || (task.grades && task.grades.length > 0) ? (
                      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap gap-2">
                          {task.specialites?.slice(0, 2).map((s: string) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800"
                            >
                              {s}
                            </span>
                          ))}
                          {task.specialites && task.specialites.length > 2 && (
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700">
                              +{task.specialites.length - 2}
                            </span>
                          )}
                          {task.grades?.map((g: string) => (
                            <span
                              key={g}
                              className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-800"
                            >
                              Grade {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Description */}
                    <div className="px-6 py-4">
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
                        {task.description || 'Aucune description fournie pour cette tâche.'}
                      </p>
                    </div>

                    <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-950/20 border-t border-gray-200 dark:border-gray-800">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {daysRemaining !== null && (
                          <div className={`flex items-center gap-2 text-sm font-medium ${
                            daysRemaining < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysRemaining <= 3
                                ? 'text-amber-600 dark:text-amber-400'
                                : daysRemaining <= 7 
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {daysRemaining < 0 
                                ? `${Math.abs(daysRemaining)}j retard` 
                                : daysRemaining === 0
                                  ? "Aujourd'hui"
                                  : `${daysRemaining}j restants`}
                            </span>
                          </div>
                        )}
                        
                        {task.nombrePlaces && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{task.nombrePlaces} places</span>
                          </div>
                        )}
                        
                        {task.ville && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{task.ville}</span>
                          </div>
                        )}
                        
                        {task.remuneree && task.prixRemuneree && (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{task.prixRemuneree} MAD</span>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={`/tasks/${task._id}`}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir plus des détails
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Affichage de <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{filteredTasks.length}</span> tâche(s)
                  {tasks.length > filteredTasks.length && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      sur {tasks.length} au total
                    </span>
                  )}
                </p>
                {tasks.length > filteredTasks.length && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">{tasks.length - filteredTasks.length} tâche(s) filtrée(s)</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow border-2 border-dashed border-gray-300 dark:border-gray-800 p-16 text-center">
            <div className="max-w-md mx-auto">
              <FileText className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Aucune tâche trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                {searchTerm || filterSpecialite || filterStatus !== 'all'
                  ? "Aucune tâche ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  : "Il n'y a pas encore de tâche dans le système. Créez-en une pour commencer !"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchTerm || filterSpecialite || filterStatus !== 'all' ? (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    Réinitialiser les filtres
                  </button>
                ) : (role === "SUPER_ADMIN" || role === "COORDINATEUR") ? (
                  <Link
                    to="/addTask"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Créer une nouvelle tâche
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;