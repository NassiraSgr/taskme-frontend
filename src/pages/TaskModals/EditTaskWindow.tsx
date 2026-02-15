import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Save, 
  X, 
  Calendar, 
  FileText, 
  Users, 
  DollarSign, 
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

const EditTaskWindow = () => {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [form, setForm] = useState({
    nom: "",
    description: "",
    type: "FORMATEUR",
    dateDebut: "",
    dateFin: "",
    remuneree: false,
    nombrePlaces: 1,
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/task/${id}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erreur lors du chargement');
      
      const data = await res.json();
      setTask(data.data);

      setForm({
        nom: data.data.nom || "",
        description: data.data.description || "",
        type: data.data.type || "FORMATEUR",
        dateDebut: data.data.dateDebut?.slice(0, 10) || "",
        dateFin: data.data.dateFin?.slice(0, 10) || "",
        remuneree: data.data.remuneree || false,
        nombrePlaces: data.data.nombrePlaces || 1,
      });
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du chargement de la tâche", 'error');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.nom.trim()) {
      showMessage("Le nom de la tâche est requis", 'error');
      return;
    }
    if (!form.dateDebut || !form.dateFin) {
      showMessage("Les dates de début et fin sont requises", 'error');
      return;
    }
    if (new Date(form.dateFin) < new Date(form.dateDebut)) {
      showMessage("La date de fin doit être après la date de début", 'error');
      return;
    }
    if (form.nombrePlaces < 1) {
      showMessage("Le nombre de places doit être au moins 1", 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/api/task/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✓ Tâche modifiée avec succès", 'success');
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        showMessage(data.message || "✗ Erreur lors de la modification", 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage("✗ Erreur de connexion au serveur", 'error');
    } finally {
      setLoading(false);
    }
  };

  const taskTypes = [
    { value: "FORMATEUR", label: "Formateur", icon: Users },
    { value: "MEMBRE_JURY", label: "Membre du jury", icon: Award },
    { value: "BENEFICIAIRE", label: "Bénéficiaire", icon: Users },
    { value: "OBSERVATEUR", label: "Observateur", icon: Users },
    { value: "CONCEPTEUR_EVALUATION", label: "Concepteur d'évaluation", icon: FileText },
  ];

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de la tâche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
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

      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Modifier la tâche
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Mettez à jour les informations de la tâche "{task.nom}"
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Indicateur d'état */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>Créée le {new Date(task.createdAt || task.dateDebut).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Informations de base */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Informations générales
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de la tâche *
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                    placeholder="Ex: Formation avancée en gestion de projet"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all h-32 resize-none"
                    placeholder="Décrivez les objectifs et responsabilités de cette tâche..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Section Type et Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Type et planning
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Type de tâche *
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {taskTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <label
                            key={type.value}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                              form.type === type.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={type.value}
                              checked={form.type === type.value}
                              onChange={(e) => handleChange("type", e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">{type.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Période
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de début *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.dateDebut}
                        onChange={(e) => handleChange("dateDebut", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de fin *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.dateFin}
                        onChange={(e) => handleChange("dateFin", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Rémunération et Places */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Rémunération
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="remuneree"
                      checked={form.remuneree}
                      onChange={(e) => handleChange("remuneree", e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remuneree" className="text-gray-900 dark:text-white font-medium">
                      Cette tâche est rémunérée
                    </label>
                  </div>
                  
                  {form.remuneree && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Montant de la rémunération (MAD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">MAD</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Capacité
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de places disponibles *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.nombrePlaces}
                      onChange={(e) => handleChange("nombrePlaces", parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      place{form.nombrePlaces > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Définissez le nombre maximum de participants pour cette tâche
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => window.close()}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>

            {/* Note */}
            <div className="text-sm text-gray-500 dark:text-gray-400 italic pt-4 border-t border-gray-200 dark:border-gray-800">
              <p>* Les champs marqués d'un astérisque sont obligatoires.</p>
              <p className="mt-1">Les modifications seront immédiatement visibles par tous les utilisateurs concernés.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskWindow;