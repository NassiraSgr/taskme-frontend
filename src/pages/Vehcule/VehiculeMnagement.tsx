import React, { useEffect, useState } from "react";
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Filter, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Tag,
  Download,
  Search,
  AlertCircle,
  ChevronRight,
  Users,
  FileText
} from "lucide-react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  disponible: boolean;
  description?: string;
  ville: string;
  occupations?: { start: string; end: string; taskTitle: string }[];
}

interface VehicleForm {
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number | "";
  disponible: boolean;
  description: string;
  ville: string;
}

interface AssignForm {
  taskId: string;
  dateDebut: string;
  dateFin: string;
  taskTitle: string;
}

const VehicleManagement = ({ userRole }: { userRole: string }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [form, setForm] = useState<VehicleForm>({
    immatriculation: "",
    marque: "",
    modele: "",
    annee: "",
    disponible: true,
    description: "",
    ville: ""
  });

  const [filterDates, setFilterDates] = useState({ 
    dateDebut: "", 
    dateFin: "", 
    ville: '',
    search: ''
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignVehicle, setAssignVehicle] = useState<Vehicle | null>(null);
  const [assignForm, setAssignForm] = useState<AssignForm>({
    taskId: "",
    dateDebut: "",
    dateFin: "",
    taskTitle: ''
  });

  const [tasks, setTasks] = useState<{ _id: string; nom: string; vehiculeRequis: boolean }[]>([]);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/vehicles", { 
        headers: { 'Content-Type': 'application/json' },
        credentials: "include" 
      });
      if (!res.ok) throw new Error('Erreur lors du chargement');
      
      const data: { vehicles: Vehicle[] } = await res.json();
      setVehicles(data.vehicles);
      setFilteredVehicles(data.vehicles);
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du chargement des véhicules", 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/tasks", { 
        headers: { 'Content-Type': 'application/json' },
        credentials: "include" 
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.date || data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchTasks();
  }, []);

  useEffect(() => {
    let result = vehicles;

    // Filtre par recherche
    if (filterDates.search) {
      const searchTerm = filterDates.search.toLowerCase();
      result = result.filter(v =>
        v.immatriculation.toLowerCase().includes(searchTerm) ||
        v.marque.toLowerCase().includes(searchTerm) ||
        v.modele.toLowerCase().includes(searchTerm) ||
        v.ville.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre par ville
    if (filterDates.ville) {
      result = result.filter(v => v.ville === filterDates.ville);
    }

    setFilteredVehicles(result);
  }, [vehicles, filterDates.search, filterDates.ville]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!form.immatriculation.trim()) {
      showMessage("L'immatriculation est requise", 'error');
      return;
    }
    if (!form.marque.trim()) {
      showMessage("La marque est requise", 'error');
      return;
    }
    if (!form.modele.trim()) {
      showMessage("Le modèle est requis", 'error');
      return;
    }
    if (!form.annee) {
      showMessage("L'année est requise", 'error');
      return;
    }
    if (!form.ville.trim()) {
      showMessage("La ville est requise", 'error');
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `https://taskme-backend-wt4m.onrender.com/api/vehicles/${editingId}`
        : "https://taskme-backend-wt4m.onrender.com/api/vehicles";

      const payload = { ...form, annee: Number(form.annee) };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      fetchVehicles();
      setForm({ 
        immatriculation: "", 
        marque: "", 
        modele: "", 
        annee: "", 
        disponible: true, 
        description: "", 
        ville: "" 
      });
      setEditingId(null);
      
      showMessage(
        editingId ? "✓ Véhicule modifié avec succès" : "✓ Véhicule ajouté avec succès",
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Erreur lors de l'opération", 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce véhicule ? Cette action est irréversible.")) return;
    
    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/vehicles/${id}`, { 
        method: "DELETE", 
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      
      fetchVehicles();
      showMessage("✓ Véhicule supprimé avec succès", 'success');
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Erreur lors de la suppression", 'error');
    }
  };

  const handleEdit = (v: Vehicle) => {
    setEditingId(v._id);
    setForm({ 
      immatriculation: v.immatriculation, 
      marque: v.marque, 
      modele: v.modele, 
      annee: v.annee, 
      disponible: v.disponible, 
      description: v.description ?? "", 
      ville: v.ville 
    });
  };

  const filterAvailable = async () => {
    if (!filterDates.dateDebut || !filterDates.dateFin) {
      setFilteredVehicles(vehicles);
      showMessage("Veuillez sélectionner les dates de début et fin", 'error');
      return;
    }

    try {
      const res = await fetch(
        `https://taskme-backend-wt4m.onrender.com/api/vehicles/available?dateDebut=${filterDates.dateDebut}&dateFin=${filterDates.dateFin}&ville=${filterDates.ville}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setFilteredVehicles(data.vehicles);
      showMessage(`${data.vehicles.length} véhicule(s) disponible(s)`, 'success');
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du filtrage", 'error');
    }
  };

  const handleAssign = async () => {
    if (!assignVehicle) return;
    
    // Validation
    if (!assignForm.taskId) {
      showMessage("Veuillez sélectionner une tâche", 'error');
      return;
    }
    if (!assignForm.dateDebut || !assignForm.dateFin) {
      showMessage("Veuillez sélectionner les dates", 'error');
      return;
    }
    if (new Date(assignForm.dateFin) < new Date(assignForm.dateDebut)) {
      showMessage("La date de fin doit être après la date de début", 'error');
      return;
    }

    try {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/vehicles/assign/${assignVehicle._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          taskId: assignForm.taskId,
          taskTitle: assignForm.taskTitle,
          start: assignForm.dateDebut,
          end: assignForm.dateFin
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'affectation");
      }
      
      setShowAssignModal(false);
      fetchVehicles();
      showMessage("✓ Véhicule assigné avec succès", 'success');
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Erreur lors de l'affectation", 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ["Immatriculation", "Marque", "Modèle", "Année", "Ville", "Disponible", "Occupations"];
    const csvData = filteredVehicles.map(v => [
      v.immatriculation,
      v.marque,
      v.modele,
      v.annee,
      v.ville,
      v.disponible ? "Oui" : "Non",
      v.occupations?.map(o => `${o.taskTitle} (${o.start.split("T")[0]} - ${o.end.split("T")[0]})`).join("; ") || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicules_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage("✓ Export CSV réussi", 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.disponible).length,
    occupied: vehicles.filter(v => !v.disponible).length,
    cities: Array.from(new Set(vehicles.map(v => v.ville))).length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestion des Véhicules
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez le parc automobile et affectez les véhicules aux tâches
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                disabled={filteredVehicles.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <Car className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Disponibles</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{stats.available}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Occupés</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-1">{stats.occupied}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Villes</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-500 mt-1">{stats.cities}</p>
                </div>
                <MapPin className="w-10 h-10 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {userRole === 'SUPER_ADMIN' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Modifier le véhicule
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Ajouter un véhicule
                  </>
                )}
              </h2>
              {editingId && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-sm font-medium rounded-full">
                  Mode édition
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Immatriculation *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="AB-123-CD"
                    value={form.immatriculation}
                    onChange={e => setForm({ ...form, immatriculation: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marque *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Toyota"
                    value={form.marque}
                    onChange={e => setForm({ ...form, marque: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modèle *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Corolla"
                    value={form.modele}
                    onChange={e => setForm({ ...form, modele: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Année *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="2020"
                    value={form.annee}
                    onChange={e => setForm({ ...form, annee: Number(e.target.value) || "" })}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ville *
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Casablanca"
                    value={form.ville}
                    onChange={e => setForm({ ...form, ville: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    État
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={String(form.disponible)}
                    onChange={e => setForm({ ...form, disponible: e.target.value === "true" })}
                  >
                    <option value="true">Disponible</option>
                    <option value="false">Indisponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Informations supplémentaires..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ 
                        immatriculation: "", 
                        marque: "", 
                        modele: "", 
                        annee: "", 
                        disponible: true, 
                        description: "", 
                        ville: "" 
                      });
                    }}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  className={`px-6 py-3 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2 ${
                    editingId
                      ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  }`}
                >
                  {editingId ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Ajouter le véhicule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Filtres et recherche
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par immatriculation, marque, modèle, ville..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={filterDates.search}
                onChange={e => setFilterDates({ ...filterDates, search: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  value={filterDates.ville}
                  onChange={e => setFilterDates({ ...filterDates, ville: e.target.value })}
                >
                  <option value="">Toutes les villes</option>
                  {Array.from(new Set(vehicles.map(v => v.ville))).map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date début
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  value={filterDates.dateDebut}
                  onChange={e => setFilterDates({ ...filterDates, dateDebut: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date fin
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  value={filterDates.dateFin}
                  onChange={e => setFilterDates({ ...filterDates, dateFin: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={filterAvailable}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Vérifier disponibilité
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des véhicules */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Liste des véhicules
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({filteredVehicles.length} sur {vehicles.length})
                </span>
              </h3>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Chargement...
                </div>
              )}
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucun véhicule trouvé
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {vehicles.length === 0 
                  ? "Aucun véhicule n'a été ajouté au système."
                  : "Aucun véhicule ne correspond à vos critères de recherche."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Véhicule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Informations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Occupations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVehicles.map(v => (
                    <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {v.immatriculation}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {v.marque} {v.modele}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {v.annee}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {v.ville}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          v.disponible
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                        }`}>
                          {v.disponible ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Disponible
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Indisponible
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-xs">
                          {v.occupations && v.occupations.length > 0 ? (
                            v.occupations.map((o, i) => (
                              <div
                                key={i}
                                className="bg-gray-100 dark:bg-gray-900/50 rounded-lg px-3 py-2 text-xs"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {o.taskTitle}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(o.start)} → {formatDate(o.end)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Aucune occupation
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {userRole === 'SUPER_ADMIN' && (
                            <>
                              <button
                                onClick={() => handleEdit(v)}
                                className="px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(v._id)}
                                className="px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          )}
                          {userRole === 'COORDINATEUR' && v.disponible && (
                            <button
                              onClick={() => {
                                setAssignVehicle(v);
                                setShowAssignModal(true);
                                setAssignForm({
                                  taskId: "",
                                  dateDebut: "",
                                  dateFin: "",
                                  taskTitle: ""
                                });
                              }}
                              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Assigner
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal d'assignation */}
        {showAssignModal && assignVehicle && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Assigner un véhicule
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {assignVehicle.immatriculation} • {assignVehicle.marque} {assignVehicle.modele}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(false)}
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
                      Tâche *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={assignForm.taskId}
                      onChange={(e) => {
                        const selectedTask = tasks.find(t => t._id === e.target.value);
                        setAssignForm({ 
                          ...assignForm, 
                          taskId: e.target.value,
                          taskTitle: selectedTask?.nom || '' 
                        });
                      }}
                    >
                      <option value="">Sélectionner une tâche</option>
                      {tasks.filter(t => t.vehiculeRequis === true).map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.nom}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Seules les tâches nécessitant un véhicule sont affichées
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={assignForm.dateDebut}
                        onChange={(e) => setAssignForm({ ...assignForm, dateDebut: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de fin *
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={assignForm.dateFin}
                        onChange={(e) => setAssignForm({ ...assignForm, dateFin: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Information</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Le véhicule sera marqué comme indisponible pendant cette période et ne pourra pas être assigné à d'autres tâches.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAssign}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmer l'assignation
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

export default VehicleManagement;