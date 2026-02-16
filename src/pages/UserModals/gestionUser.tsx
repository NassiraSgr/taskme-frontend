import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  Award, 
  Calendar,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Download,
  RefreshCw,
  GraduationCap,
  BookOpen,
  ChevronRight,
  X
} from "lucide-react";
import './gestionUser.css'; 

const UsersManagement = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    specialite: "",
    grade: "",
    actif: ""
  });

  // États séparés pour les diplômes et formations
  const [newDiploma, setNewDiploma] = useState("");
  const [newFormation, setNewFormation] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "AUDITEUR",
    specialite: "PEDAGOGIQUE",
    grade: "A",
    diplomes: [] as string[],
    formations: [] as string[],
    anciennete: 0,
    actif: true,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/users", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      const filtered = (data.data || []).filter((us: any) => 
        us._id !== userId && us.role !== 'SUPER_ADMIN'
      );
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (err) {
      console.error(err);
      showMessage("Impossible de charger les utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrage des utilisateurs
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    if (filters.specialite) {
      result = result.filter(user => user.specialite === filters.specialite);
    }
    
    if (filters.grade) {
      result = result.filter(user => user.grade === filters.grade);
    }
    
    if (filters.actif !== "") {
      result = result.filter(user => user.actif === (filters.actif === "true"));
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, filters]);

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setLoading(true);
    const payload: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      role: formData.role,
      specialite: formData.specialite,
      grade: formData.grade,
      diplomes: formData.diplomes,
      formations: formData.formations,
      anciennete: formData.anciennete,
      actif: formData.actif,
    };

    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/user/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la modification");
      }

      showMessage("Utilisateur modifié avec succès");
      setEditingId(null);
      resetForm();
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Erreur lors de la modification", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingId(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
      specialite: user.specialite,
      grade: user.grade,
      diplomes: user.diplomes || [],
      formations: user.formations || [],
      anciennete: user.anciennete || 0,
      actif: user.actif !== false,
    });
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
    
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      
      showMessage("Utilisateur supprimé avec succès");
      await loadUsers();
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors de la suppression", "error");
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/user/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ actif: !currentStatus }),
      });
      
      if (!res.ok) throw new Error("Erreur lors du changement de statut");
      
      showMessage(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du changement de statut", "error");
    }
  };

  // Gestion des diplômes
  const handleAddDiploma = () => {
    if (newDiploma.trim()) {
      setFormData(prev => ({
        ...prev,
        diplomes: [...prev.diplomes, newDiploma.trim()]
      }));
      setNewDiploma('');
    }
  };

  const handleRemoveDiploma = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diplomes: prev.diplomes.filter((_, i) => i !== index)
    }));
  };

  // Gestion des formations
  const handleAddFormation = () => {
    if (newFormation.trim()) {
      setFormData(prev => ({
        ...prev,
        formations: [...prev.formations, newFormation.trim()]
      }));
      setNewFormation('');
    }
  };

  const handleRemoveFormation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      formations: prev.formations.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setNewDiploma('');
    setNewFormation('');
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "AUDITEUR",
      specialite: "PEDAGOGIQUE",
      grade: "A",
      diplomes: [],
      formations: [],
      anciennete: 0,
      actif: true,
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      role: "",
      specialite: "",
      grade: "",
      actif: ""
    });
  };

  // FONCTION exportToCSV - AJOUTÉE ICI
  const exportToCSV = () => {
    const headers = ["Nom", "Prénom", "Email", "Rôle", "Spécialité", "Grade", "Ancienneté", "Statut"];
    const csvData = filteredUsers.map(user => [
      user.lastName,
      user.firstName,
      user.email,
      user.role,
      user.specialite,
      user.grade,
      user.anciennete,
      user.actif ? "Actif" : "Inactif"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-purple-100 text-purple-800";
      case "COORDINATEUR": return "bg-blue-100 text-blue-800";
      case "AUDITEUR": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSpecialiteColor = (specialite: string) => {
    switch (specialite) {
      case "PEDAGOGIQUE": return "bg-pink-100 text-pink-800";
      case "ORIENTATION": return "bg-indigo-100 text-indigo-800";
      case "PLANIFICATION": return "bg-amber-100 text-amber-800";
      case "FINANCIER": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les comptes, permissions et informations des utilisateurs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.actif).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Coordinateurs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'COORDINATEUR').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Auditeurs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'AUDITEUR').length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
            >
              <option value="">Tous les rôles</option>
              <option value="AUDITEUR">Auditeur</option>
              <option value="COORDINATEUR">Coordinateur</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.specialite}
              onChange={(e) => setFilters({...filters, specialite: e.target.value})}
            >
              <option value="">Toutes spécialités</option>
              <option value="PEDAGOGIQUE">Pédagogique</option>
              <option value="ORIENTATION">Orientation</option>
              <option value="PLANIFICATION">Planification</option>
              <option value="FINANCIER">Financier</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.actif}
              onChange={(e) => setFilters({...filters, actif: e.target.value})}
            >
              <option value="">Tous statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Message d'alerte */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de modification - NOUVELLE STRUCTURE */}
      {editingId && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* En-tête du formulaire */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                  <p className="text-gray-600">Mettez à jour les informations de l'utilisateur</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Navigation des sections */}
              <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                <span className="flex items-center gap-1 text-blue-600">
                  <User className="w-4 h-4" />
                  Informations
                </span>
                <ChevronRight className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Professionnel
                </span>
                <ChevronRight className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  Qualifications
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1 : Informations personnelles */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      Informations personnelles
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Entrez le prénom"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Entrez le nom"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="exemple@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 : Informations professionnelles */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                      </div>
                      Informations professionnelles
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          Rôle
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="AUDITEUR">Auditeur</option>
                          <option value="COORDINATEUR">Coordinateur</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spécialité
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={formData.specialite}
                          onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                        >
                          <option value="PEDAGOGIQUE">Pédagogique</option>
                          <option value="ORIENTATION">Orientation</option>
                          <option value="PLANIFICATION">Planification</option>
                          <option value="FINANCIER">Financier</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Grade
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          >
                            <option value="A">Grade A</option>
                            <option value="B">Grade B</option>
                            <option value="C">Grade C</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Ancienneté
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                              value={formData.anciennete}
                              onChange={(e) => setFormData({ ...formData, anciennete: Number(e.target.value) })}
                              min="0"
                              max="50"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ans
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${formData.actif ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {formData.actif ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Compte actif</p>
                              <p className="text-sm text-gray-500">
                                {formData.actif ? "L'utilisateur peut se connecter" : "Le compte est désactivé"}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.actif}
                              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                              id="account-active"
                            />
                            <label
                              htmlFor="account-active"
                              className={`block w-14 h-8 rounded-full cursor-pointer transition-all duration-300 ${formData.actif ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.actif ? 'left-7' : 'left-1'}`}></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 : Qualifications */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-amber-600" />
                      </div>
                      Qualifications
                    </h3>
                    
                    <div className="space-y-8">
                      {/* Diplômes */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Diplômes
                          </label>
                          <span className="text-xs text-gray-500">
                            {formData.diplomes.length} diplôme(s)
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {formData.diplomes.map((diploma, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                              <span className="text-sm text-gray-800">{diploma}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDiploma(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={newDiploma}
                            onChange={(e) => setNewDiploma(e.target.value)}
                            placeholder="Ajouter un diplôme"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiploma())}
                          />
                          <button
                            type="button"
                            onClick={handleAddDiploma}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>

                      {/* Formations */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Formations
                          </label>
                          <span className="text-xs text-gray-500">
                            {formData.formations.length} formation(s)
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {formData.formations.map((formation, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                              <span className="text-sm text-gray-800">{formation}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFormation(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={newFormation}
                            onChange={(e) => setNewFormation(e.target.value)}
                            placeholder="Ajouter une formation"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFormation())}
                          />
                          <button
                            type="button"
                            onClick={handleAddFormation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mettre à jour l'utilisateur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

  {/* Header */}
  <div className="p-5 border-b bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <h3 className="text-lg font-semibold text-gray-900">
      Utilisateurs <span className="text-gray-400">({filteredUsers.length})</span>
    </h3>

    <input
      type="text"
      placeholder="Rechercher..."
      className="w-full md:w-72 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Desktop Table */}
  <div className="overflow-x-auto max-h-[520px] scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
    <table className="w-full border-separate border-spacing-y-3">
      
      {/* Header */}
      <thead className="sticky top-0 z-10">
        <tr   className="bg-white even:bg-gray-50 shadow-sm hover:shadow-lg transition-all rounded-xl">
          <th className="px-6 py-3 text-left w-[32%]">Utilisateur</th>
          <th className="px-6 py-3 text-left w-[20%]">Rôle</th>
          <th className="px-6 py-3 text-left w-[20%]">Grade</th>
          <th className="px-6 py-3 text-left w-[20%]">Statut</th>
          <th className="px-6 py-3 text-left w-[20%]">Actions</th>
        </tr>
      </thead>

      {/* Body */}
      <tbody>

        {filteredUsers.length === 0 && (
          <tr className="bg-white">
            <td colSpan={5} className="py-16 text-center text-gray-400">
              Aucun utilisateur trouvé
            </td>
          </tr>
        )}

        {filteredUsers.map((user) => (
          <tr
            key={user._id}
              className="bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 rounded-xl"
          >
            {/* User */}
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-tr from-blue-400 to-purple-500 hover:scale-110 transition-transform">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </td>

            {/* Role */}
            <td className="px-6 py-5">
              <div className="space-y-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} bg-gradient-to-r from-blue-100 to-blue-50 shadow-sm`}>
                  {user.role}
                </span>
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getSpecialiteColor(user.specialite)}`}>
                    {user.specialite}
                  </span>
                </div>
              </div>
            </td>

            {/* Grade */}
            <td className="px-6 py-5 w-[140px]">
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{user.grade}</span>
                <span className="text-xs text-gray-500"></span>
              </div>
            </td>

            {/* Statut */}
            <td className="px-6 py-5 w-[130px]">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${user.actif ? "bg-green-500" : "bg-gray-400"}`}></span>
              {user.actif ? "Actif" : "Inactif"}

            </td>


            {/* Actions */}
            <td className="px-6 py-5">
              <div className="flex gap-1">

                <button
                  onClick={() => handleEditUser(user)}
                  className="p-2 hover:bg-blue-50 hover:scale-110 transition-transform duration-200 text-blue-600 rounded-lg"                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => navigate(`/chat/direct/${user._id}`)}
                  className="p-2 hover:bg-blue-50 hover:scale-110 transition-transform duration-200 text-blue-600 rounded-lg"                >
                  <MessageCircle size={16} />
                </button>


                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="p-2 hover:bg-blue-50 hover:scale-110 transition-transform duration-200 text-blue-600 rounded-lg"                >
                  <Trash2 size={16} />
                </button>

              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Cards */}
  <div className="md:hidden p-3 space-y-3">
    {filteredUsers.map((user) => (
      <div key={user._id} className="bg-white border rounded-xl p-4 shadow-sm">

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>
            {user.role}
          </span>

          <span className={`px-2 py-0.5 rounded-full text-xs ${getSpecialiteColor(user.specialite)}`}>
            {user.specialite}
          </span>

          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
            Grade {user.grade}
          </span>
        </div>

        <div className="flex justify-between items-center">

          <button
            onClick={() => toggleUserStatus(user._id, user.actif)}
            className={`px-3 py-1 rounded-full text-xs ${
              user.actif
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {user.actif ? "Actif" : "Inactif"}
          </button>

          <div className="flex gap-1">
            <Edit size={16} className="text-blue-600" />
            <MessageCircle size={16} className="text-green-600" />
            <Eye size={16} className="text-gray-700" />
            <Trash2 size={16} className="text-red-600" />
          </div>
        </div>

      </div>
    ))}
  </div>

</div>


    </div>
  );
};

export default UsersManagement;