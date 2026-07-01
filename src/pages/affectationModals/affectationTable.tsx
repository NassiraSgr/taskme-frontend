import React, { useEffect, useState } from "react";
import { 
  Users, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  UserCheck,
  Settings,
  Eye
} from "lucide-react";
import Loader from "../../components/Loader/Loader";

type Affectation = {
  _id: string;
  task: { _id: string; title?: string; nom?: string };
  auditeur: { _id: string; firstName: string; lastName: string };
  mode: 'manuel' | 'semi_auto' | 'auto';
  statut: 'en_attente' | 'accepte' | 'refuse' | 'delegue';
  createdAt?: string;
};

type User = { _id: string; firstName: string; lastName: string };

const AffectationsTable = () => {
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAuditeurId, setNewAuditeurId] = useState<string>('');
  const [newMode, setNewMode] = useState<'manuel' | 'semi_auto' | 'auto'>('manuel');
  const [statut, setStatut] = useState<'en_attente' | 'accepte' | 'refuse' | 'delegue'>('en_attente');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  
  const limit = 10;

  const fetchAffectations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterMode && { mode: filterMode }),
        ...(filterStatut && { statut: filterStatut })
      });

      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/affectations?${queryParams}`, { 
        credentials: 'include' 
      });
      
      if (!res.ok) throw new Error('Erreur lors du chargement des affectations');
      const data = await res.json();
      setAffectations(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du chargement des affectations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data.data.filter((u: any) => u.role === 'AUDITEUR' && u.actif));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAffectations = async () => {
    setLoading(true);
    await fetchAffectations();
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    refreshAffectations();
  }, [page, searchTerm, filterMode, filterStatut]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette affectation ?")) return;
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/affectation/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setAffectations(prev => prev.filter(a => a._id !== id));
      showMessage('Affectation supprimée avec succès', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/affectation/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          auditeur: newAuditeurId, 
          mode: newMode, 
          statut: statut 
        })
      });
      
      if (!res.ok) throw new Error('Erreur lors de la modification');
      setEditingId(null);
      fetchAffectations();
      showMessage('Affectation modifiée avec succès', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Erreur lors de la modification', 'error');
    }
  };

  const startEdit = (affectation: Affectation) => {
    setEditingId(affectation._id);
    setNewAuditeurId(affectation.auditeur._id);
    setNewMode(affectation.mode);
    setStatut(affectation.statut);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'accepte': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'refuse': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'en_attente': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'delegue': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'accepte': return 'bg-green-100 text-green-800 border-green-200';
      case 'refuse': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_attente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'delegue': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'manuel': return 'bg-purple-100 text-purple-800';
      case 'semi_auto': return 'bg-indigo-100 text-indigo-800';
      case 'auto': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterMode('');
    setFilterStatut('');
  };

  const exportToCSV = () => {
    const headers = ["Tâche", "Auditeur", "Mode", "Statut", "Date"];
    const csvData = affectations.map(a => [
      a.task.nom || a.task.title || 'N/A',
      `${a.auditeur.firstName} ${a.auditeur.lastName}`,
      a.mode,
      a.statut,
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affectations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);



  if (loading) {
    return <Loader />;
  }
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold  flex items-center gap-3">
              <Settings className="w-8 h-8 " />
              Gestion des affectations
            </h2>
            <p className="text-gray-600 mt-2">
              Gérer et suivre les affectations de tâches aux auditeurs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={refreshAffectations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total affectations</p>
                <p className="text-2xl font-bold text-gray-900">{affectations.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acceptées</p>
                <p className="text-2xl font-bold text-green-600">
                  {affectations.filter(a => a.statut === 'accepte').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {affectations.filter(a => a.statut === 'en_attente').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Refusées</p>
                <p className="text-2xl font-bold text-red-600">
                  {affectations.filter(a => a.statut === 'refuse').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par tâche ou auditeur..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value="">Tous les modes</option>
              <option value="manuel">Manuel</option>
              <option value="semi_auto">Semi-auto</option>
              <option value="auto">Automatique</option>
            </select>
            
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
              <option value="delegue">Délégué</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
            <button 
              onClick={() => setMessage('')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tâche
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Auditeur
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-gray-600">Chargement des affectations...</p>
                  </div>
                </td>
              </tr>
            ) : affectations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Settings className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucune affectation trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
                  </div>
                </td>
              </tr>
            ) : (
              affectations.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {a.task.nom || a.task.title || 'Non spécifié'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === a._id ? (
                      <select
                        value={newAuditeurId}
                        onChange={(e) => setNewAuditeurId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un auditeur</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {a.auditeur.firstName} {a.auditeur.lastName}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === a._id ? (
                      <select
                        value={newMode}
                        onChange={(e) => setNewMode(e.target.value as 'manuel' | 'semi_auto' | 'auto')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="manuel">Manuel</option>
                        <option value="semi_auto">Semi-auto</option>
                        <option value="auto">Automatique</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getModeColor(a.mode)}`}>
                        {a.mode === 'auto' ? 'Automatique' : a.mode === 'semi_auto' ? 'Semi-auto' : 'Manuel'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === a._id ? (
                      <select
                        value={statut}
                        onChange={(e) => setStatut(e.target.value as 'en_attente' | 'accepte' | 'refuse' | 'delegue')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="accepte">Accepté</option>
                        <option value="refuse">Refusé</option>
                        <option value="delegue">Délégué</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getStatutIcon(a.statut)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatutColor(a.statut)}`}>
                          {a.statut === 'accepte' ? 'Accepté' : 
                           a.statut === 'refuse' ? 'Refusé' : 
                           a.statut === 'en_attente' ? 'En attente' : 'Délégué'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingId === a._id ? (
                        <>
                          <button
                            onClick={() => handleEdit(a._id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(a)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Fonctionnalité de visualisation */}}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {affectations.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(page - 1) * limit + 1}</span> à <span className="font-medium">
                {Math.min(page * limit, affectations.length)}
              </span> sur <span className="font-medium">{affectations.length}</span> affectations
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className={`p-2 rounded-lg ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum:number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${page === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
                className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffectationsTable;