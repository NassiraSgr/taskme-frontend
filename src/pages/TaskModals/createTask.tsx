import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";


interface FormErrors {
  [key: string]: string;
}

interface TaskFormData {
  nom: string;
  description: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  remuneree: boolean;
  prixRemuneree: number | '';
  estCommune: boolean;
  vehiculeRequis: boolean;
  ligne: string;
  ville: string;
  nombrePlaces: number;
  specialites: string[];
  grades: string[];
}

const CreateTask = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TaskFormData>({
    nom: '',
    description: '',
    type: 'FORMATEUR',
    dateDebut: '',
    dateFin: '',
    remuneree: false,
    prixRemuneree: '',
    estCommune: false,
    vehiculeRequis: false,
    ligne: 'RABAT_CASA',
    ville: '',
    nombrePlaces: 1,
    specialites: [],
    grades: []
  });

  const [adminFile, setAdminFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Options mémorisées
  const typeOptions = useMemo(() => [
    { value: "FORMATEUR", label: "Formateur" },
    { value: "MEMBRE_JURY", label: "Jury" },
    { value: "BENEFICIAIRE", label: "Bénéficiaire" },
    { value: "OBSERVATEUR", label: "Observateur" },
    { value: "CONCEPTEUR_EVALUATION", label: "Concepteur d'évaluation" }
  ], []);

  const ligneOptions = useMemo(() => [
    { value: "RABAT_CASA", label: "Rabat – Casa" },
    { value: "MEKNES_ERRACHIDIA", label: "Meknès – Errachidia" },
    { value: "MARRAKECH_AGADIR", label: "Marrakech – Agadir" }
  ], []);

  const specialiteOptions = useMemo(() => [
    { value: "PEDAGOGIQUE", label: "Pédagogique" },
    { value: "ORIENTATION", label: "Orientation" },
    { value: "PLANIFICATION", label: "Planification" },
    { value: "FINANCIER", label: "Financier" }
  ], []);

  const gradeOptions = useMemo(() => ["A", "B", "C"], []);

  // Fonction de mise à jour du formulaire
  const updateFormData = useCallback(<K extends keyof TaskFormData>(
    key: K,
    value: TaskFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Nettoyer l'erreur du champ modifié
    if (formErrors[key]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [formErrors]);

  // Marquer un champ comme touché
  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field));
  }, []);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom de la tâche est requis";
    } else if (formData.nom.trim().length < 3) {
      errors.nom = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est requise";
    } else if (formData.description.trim().length < 10) {
      errors.description = "La description doit contenir au moins 10 caractères";
    }

    if (!formData.dateDebut) {
      errors.dateDebut = "La date de début est requise";
    }

    if (!formData.dateFin) {
      errors.dateFin = "La date de fin est requise";
    }

    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      
      if (debut > fin) {
        errors.dateFin = "La date de fin doit être postérieure à la date de début";
      }
      
      // Vérifier que les dates ne sont pas dans le passé
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (debut < today) {
        errors.dateDebut = "La date de début ne peut pas être dans le passé";
      }
    }

    if (formData.remuneree) {
      if (!formData.prixRemuneree || Number(formData.prixRemuneree) <= 0) {
        errors.prixRemuneree = "Le montant de rémunération doit être supérieur à 0";
      } else if (Number(formData.prixRemuneree) > 1000000) {
        errors.prixRemuneree = "Le montant semble trop élevé";
      }
    }

    if (formData.specialites.length === 0) {
      errors.specialites = "Sélectionnez au moins une spécialité";
    }

    if (formData.grades.length === 0) {
      errors.grades = "Sélectionnez au moins un grade";
    }

    if (formData.vehiculeRequis && !formData.ville.trim()) {
      errors.ville = "La ville de destination est requise si un véhicule est requis";
    }

    if (formData.nombrePlaces < 1 || formData.nombrePlaces > 100) {
      errors.nombrePlaces = "Le nombre de places doit être entre 1 et 100";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSucces('');

    // Marquer tous les champs comme touchés
    const allFields = new Set([
      'nom', 'description', 'dateDebut', 'dateFin', 
      'specialites', 'grades', 'nombrePlaces'
    ]);
    setTouched(allFields);

    if (!validateForm()) {
      setLoading(false);
      setError("Veuillez corriger les erreurs dans le formulaire");
      
      // Scroll vers la première erreur
      setTimeout(() => {
        const firstError = document.querySelector('.is-invalid');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("nom", formData.nom.trim());
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("type", formData.type);
    formDataToSend.append("dateDebut", formData.dateDebut);
    formDataToSend.append("dateFin", formData.dateFin);
    formDataToSend.append("remuneree", String(formData.remuneree));
    formDataToSend.append("prixRemuneree", String(formData.prixRemuneree || 0));
    formDataToSend.append("estCommune", String(formData.estCommune));
    formDataToSend.append("vehiculeRequis", String(formData.vehiculeRequis));
    formDataToSend.append("ligne", formData.ligne);
    formDataToSend.append("ville", formData.ville.trim());
    formDataToSend.append("nombrePlaces", String(formData.nombrePlaces));

    formData.specialites.forEach(s => formDataToSend.append("specialites[]", s));
    formData.grades.forEach(g => formDataToSend.append("grades[]", g));

    if (adminFile) {
      formDataToSend.append("adminFile", adminFile);
    }

    try {
      const response = await fetch("https://taskme-backend-wt4m.onrender.com/api/addTask", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la tâche");
      }

      const data = await response.json();
      console.log("Tâche créée:", data);

      setSucces("✓ Tâche créée avec succès ! Redirection en cours...");
      
      setTimeout(() => {
        navigate("/tasks");
      }, 2000);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message || "Erreur lors de la création de la tâche");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Gestion du fichier
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type !== "application/pdf") {
        setError("⚠ Veuillez sélectionner un fichier PDF uniquement");
        setAdminFile(null);
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("⚠ Le fichier est trop volumineux (maximum 5MB)");
        setAdminFile(null);
        e.target.value = '';
        return;
      }
      
      setAdminFile(file);
    } else {
      setAdminFile(null);
    }
  }, []);

  // Gestion des spécialités
  const toggleSpecialite = useCallback((spec: string) => {
    const newSpecialites = formData.specialites.includes(spec)
      ? formData.specialites.filter(s => s !== spec)
      : [...formData.specialites, spec];
    
    updateFormData('specialites', newSpecialites);
    handleBlur('specialites');
  }, [formData.specialites, updateFormData, handleBlur]);

  // Gestion des grades
  const toggleGrade = useCallback((grade: string) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade];
    
    updateFormData('grades', newGrades);
    handleBlur('grades');
  }, [formData.grades, updateFormData, handleBlur]);

  // Calcul de la progression
  const progressPercentage = useMemo(() => {
    const fields = [
      formData.nom,
      formData.description,
      formData.dateDebut,
      formData.dateFin,
      formData.specialites.length > 0,
      formData.grades.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  return (
    <div className="container mt-4 mb-5">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col">
          <button 
            className="btn btn-link text-decoration-none ps-0 mb-3"
            onClick={() => navigate("/tasks")}
            type="button"
          >
            ← Retour aux tâches
          </button>
          
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="bg-primary bg-opacity-10 p-3 rounded-3">
              <svg width="32" height="32" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </div>
            <div>
              <h2 className="mb-1">Créer une nouvelle tâche</h2>
              <p className="text-muted mb-0">Remplissez les informations nécessaires pour créer une tâche</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de progression */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-medium">Progression du formulaire</small>
            <small className="text-muted">{progressPercentage}%</small>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progressPercentage}%`, transition: 'width 0.3s ease' }}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {succes && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
          <svg width="24" height="24" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <div className="flex-grow-1">{succes}</div>
          <button type="button" className="btn-close" onClick={() => setSucces('')} aria-label="Close"></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
          <svg width="24" height="24" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <div className="flex-grow-1">{error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Informations de base */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
              </svg>
              Informations de base
            </h5>
          </div>
          <div className="card-body">
            {/* Nom de la tâche */}
            <div className="mb-3">
              <label className="form-label fw-medium">
                Nom de la tâche <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${touched.has('nom') && formErrors.nom ? 'is-invalid' : ''} ${touched.has('nom') && !formErrors.nom && formData.nom ? 'is-valid' : ''}`}
                placeholder="Ex: Formation pédagogique avancée"
                value={formData.nom}
                onChange={(e) => updateFormData('nom', e.target.value)}
                onBlur={() => handleBlur('nom')}
              />
              {touched.has('nom') && formErrors.nom && (
                <div className="invalid-feedback">{formErrors.nom}</div>
              )}
              {formData.nom && (
                <small className="text-muted">{formData.nom.length} caractères</small>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-medium">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${touched.has('description') && formErrors.description ? 'is-invalid' : ''} ${touched.has('description') && !formErrors.description && formData.description ? 'is-valid' : ''}`}
                placeholder="Décrivez la tâche en détail..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                rows={4}
              />
              {touched.has('description') && formErrors.description && (
                <div className="invalid-feedback">{formErrors.description}</div>
              )}
              <div className="d-flex justify-content-between">
                <small className="text-muted">Minimum 10 caractères</small>
                <small className="text-muted">{formData.description.length} caractères</small>
              </div>
            </div>

            {/* Type */}
            <div className="mb-3">
              <label className="form-label fw-medium">
                Type de tâche <span className="text-danger">*</span>
              </label>
              <select 
                className="form-select"
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates et rémunération */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
              Période et rémunération
            </h5>
          </div>
          <div className="card-body">
            {/* Dates */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium">
                  Date de début <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  className={`form-control ${touched.has('dateDebut') && formErrors.dateDebut ? 'is-invalid' : ''} ${touched.has('dateDebut') && !formErrors.dateDebut && formData.dateDebut ? 'is-valid' : ''}`}
                  value={formData.dateDebut}
                  onChange={(e) => updateFormData('dateDebut', e.target.value)}
                  onBlur={() => handleBlur('dateDebut')}
                />
                {touched.has('dateDebut') && formErrors.dateDebut && (
                  <div className="invalid-feedback">{formErrors.dateDebut}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium">
                  Date de fin <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  className={`form-control ${touched.has('dateFin') && formErrors.dateFin ? 'is-invalid' : ''} ${touched.has('dateFin') && !formErrors.dateFin && formData.dateFin ? 'is-valid' : ''}`}
                  value={formData.dateFin}
                  onChange={(e) => updateFormData('dateFin', e.target.value)}
                  onBlur={() => handleBlur('dateFin')}
                />
                {touched.has('dateFin') && formErrors.dateFin && (
                  <div className="invalid-feedback">{formErrors.dateFin}</div>
                )}
              </div>
            </div>

            {/* Rémunération */}
            <div className="mb-3">
              <label className="form-label fw-medium d-block">Tâche rémunérée</label>
              
              <div className="btn-group w-100" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="remuneration" 
                  id="paid-yes" 
                  checked={formData.remuneree === true}
                  onChange={() => updateFormData('remuneree', true)}
                />
                <label className="btn btn-outline-success" htmlFor="paid-yes">
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                  </svg>
                  Rémunérée
                </label>
                
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="remuneration" 
                  id="paid-no" 
                  checked={formData.remuneree === false}
                  onChange={() => {
                    updateFormData('remuneree', false);
                    updateFormData('prixRemuneree', '');
                  }}
                />
                <label className="btn btn-outline-primary" htmlFor="paid-no">
                  Gratuite
                </label>
              </div>
            </div>

            {/* Prix si rémunéré */}
            {formData.remuneree && (
              <div className="mb-3 animate__animated animate__fadeIn">
                <label className="form-label fw-medium">
                  Montant de la rémunération (MAD) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                    </svg>
                  </span>
                  <input
                    type="number"
                    className={`form-control ${formErrors.prixRemuneree ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.prixRemuneree}
                    onChange={(e) => updateFormData('prixRemuneree', e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  {formErrors.prixRemuneree && (
                    <div className="invalid-feedback">{formErrors.prixRemuneree}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Critères de sélection */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
              </svg>
              Critères de sélection
            </h5>
          </div>
          <div className="card-body">
            {/* Spécialités */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                Spécialités requises <span className="text-danger">*</span>
              </label>
              <div className="row g-2">
                {specialiteOptions.map((spec) => (
                  <div className="col-md-6 col-lg-3" key={spec.value}>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`spec-${spec.value}`}
                        checked={formData.specialites.includes(spec.value)}
                        onChange={() => toggleSpecialite(spec.value)}
                      />
                      <label className="form-check-label" htmlFor={`spec-${spec.value}`}>
                        {spec.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {touched.has('specialites') && formErrors.specialites && (
                <small className="text-danger">{formErrors.specialites}</small>
              )}
              {formData.specialites.length > 0 && (
                <small className="text-muted d-block mt-2">
                  {formData.specialites.length} spécialité{formData.specialites.length > 1 ? 's' : ''} sélectionnée{formData.specialites.length > 1 ? 's' : ''}
                </small>
              )}
            </div>

            {/* Grades */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                Grades requis <span className="text-danger">*</span>
              </label>
              <div className="row g-2">
                {gradeOptions.map((grade) => (
                  <div className="col-4" key={grade}>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`grade-${grade}`}
                        checked={formData.grades.includes(grade)}
                        onChange={() => toggleGrade(grade)}
                      />
                      <label className="form-check-label" htmlFor={`grade-${grade}`}>
                        Grade {grade}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {touched.has('grades') && formErrors.grades && (
                <small className="text-danger">{formErrors.grades}</small>
              )}
              {formData.grades.length > 0 && (
                <small className="text-muted d-block mt-2">
                  {formData.grades.length} grade{formData.grades.length > 1 ? 's' : ''} sélectionné{formData.grades.length > 1 ? 's' : ''}
                </small>
              )}
            </div>

            {/* Type de tâche (commune/particulière) */}
            <div className="mb-3">
              <label className="form-label fw-medium">Portée de la tâche</label>
              
              <div className="btn-group w-100" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="estCommune" 
                  id="commune-yes" 
                  checked={formData.estCommune === true}
                  onChange={() => updateFormData('estCommune', true)}
                />
                <label className="btn btn-outline-primary" htmlFor="commune-yes">
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                  </svg>
                  Commune
                </label>
                
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="estCommune" 
                  id="commune-no" 
                  checked={formData.estCommune === false}
                  onChange={() => updateFormData('estCommune', false)}
                />
                <label className="btn btn-outline-primary" htmlFor="commune-no">
                  Particulière
                </label>
              </div>
            </div>
          </div>
        </div>

        {/*  Transport */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M0 3.5A.5.5 0 0 1 .5 3H1c.325 0 .621.192.749.492l.826 1.93C2.896 5.809 3.49 6 4.1 6h7.8c.61 0 1.204-.191 1.525-.578l.826-1.93A.75.75 0 0 1 15 3h.5a.5.5 0 0 1 0 1h-.5c-.065 0-.13.026-.177.073l-.826 1.93C13.73 6.464 12.97 7 12.1 7H4.1c-.87 0-1.63-.536-1.897-.997L1.377 4.073A.25.25 0 0 0 1.2 4H.5a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5.5v.5h4v-.5a.5.5 0 0 1 1 0v.5h4v-.5a.5.5 0 0 1 1 0v.5a.5.5 0 0 1-.5.5H11v.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10H3.5A.5.5 0 0 1 3 9.5v-.5a.5.5 0 0 1 .5-.5H3zm1.5 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
              </svg>
              Transport et localisation
            </h5>
          </div>
          <div className="card-body">
            {/* Véhicule requis */}
            <div className="mb-3">
              <label className="form-label fw-medium">Véhicule requis</label>
              
              <div className="btn-group w-100" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="vehicle" 
                  id="vehicle-yes" 
                  checked={formData.vehiculeRequis === true}
                  onChange={() => updateFormData('vehiculeRequis', true)}
                />
                <label className="btn btn-outline-primary" htmlFor="vehicle-yes">
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M0 3.5A.5.5 0 0 1 .5 3H1c.325 0 .621.192.749.492l.826 1.93C2.896 5.809 3.49 6 4.1 6h7.8c.61 0 1.204-.191 1.525-.578l.826-1.93A.75.75 0 0 1 15 3h.5a.5.5 0 0 1 0 1h-.5c-.065 0-.13.026-.177.073l-.826 1.93C13.73 6.464 12.97 7 12.1 7H4.1c-.87 0-1.63-.536-1.897-.997L1.377 4.073A.25.25 0 0 0 1.2 4H.5a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5.5v.5h4v-.5a.5.5 0 0 1 1 0v.5h4v-.5a.5.5 0 0 1 1 0v.5a.5.5 0 0 1-.5.5H11v.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10H3.5A.5.5 0 0 1 3 9.5v-.5a.5.5 0 0 1 .5-.5H3zm1.5 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                  Oui
                </label>
                
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="vehicle" 
                  id="vehicle-no" 
                  checked={formData.vehiculeRequis === false}
                  onChange={() => updateFormData('vehiculeRequis', false)}
                />
                <label className="btn btn-outline-primary" htmlFor="vehicle-no">
                  Non
                </label>
              </div>
            </div>

            {/* Champs conditionnels si véhicule requis */}
            {formData.vehiculeRequis && (
              <div className="animate__animated animate__fadeIn">
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z"/>
                    </svg>
                    Ligne de transport
                  </label>
                  <select 
                    className="form-select"
                    value={formData.ligne}
                    onChange={(e) => updateFormData('ligne', e.target.value)}
                  >
                    {ligneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">
                    <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
                    </svg>
                    Ville de destination <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.ville ? 'is-invalid' : ''}`}
                    placeholder="Ex: Casablanca"
                    value={formData.ville}
                    onChange={(e) => updateFormData('ville', e.target.value)}
                  />
                  {formErrors.ville && (
                    <div className="invalid-feedback">{formErrors.ville}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents et capacité */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
              </svg>
              Documents et capacité
            </h5>
          </div>
          <div className="card-body">
            {/* Fichier PDF */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                Fichier administratif (PDF)
                <span className="text-muted ms-2" style={{ fontSize: '0.875rem' }}>Optionnel</span>
              </label>
              
              {!adminFile ? (
                <div className="border border-2 border-dashed rounded p-4 text-center" style={{ borderColor: '#dee2e6' }}>
                  <svg width="48" height="48" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                  </svg>
                  <div className="mb-2">
                    <label htmlFor="file-upload" className="btn btn-primary btn-sm">
                      Sélectionner un fichier
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="d-none"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                  <small className="text-muted d-block">PDF uniquement, max 5MB</small>
                </div>
              ) : (
                <div className="alert alert-info d-flex align-items-center justify-content-between mb-0">
                  <div className="d-flex align-items-center gap-2">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                    <div>
                      <div className="fw-medium">{adminFile.name}</div>
                      <small className="text-muted">{(adminFile.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setAdminFile(null)}
                  >
                    ✕ Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* Nombre de places */}
            <div className="mb-3">
              <label className="form-label fw-medium">
                <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
                Nombre de places <span className="text-danger">*</span>
              </label>
              <div className="input-group" style={{ maxWidth: '300px' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => formData.nombrePlaces > 1 && updateFormData('nombrePlaces', formData.nombrePlaces - 1)}
                  disabled={formData.nombrePlaces <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className={`form-control text-center ${formErrors.nombrePlaces ? 'is-invalid' : ''}`}
                  min="1"
                  max="100"
                  value={formData.nombrePlaces}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= 100) {
                      updateFormData('nombrePlaces', value);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => formData.nombrePlaces < 100 && updateFormData('nombrePlaces', formData.nombrePlaces + 1)}
                  disabled={formData.nombrePlaces >= 100}
                >
                  +
                </button>
              </div>
              {formErrors.nombrePlaces && (
                <small className="text-danger">{formErrors.nombrePlaces}</small>
              )}
              <small className="text-muted d-block mt-1">
                {formData.nombrePlaces} place{formData.nombrePlaces > 1 ? 's' : ''} disponible{formData.nombrePlaces > 1 ? 's' : ''}
              </small>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="card border-0 shadow-lg sticky-bottom" style={{ bottom: '20px' }}>
          <div className="card-body">
            <div className="d-flex gap-3 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/tasks")}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                className="btn btn-primary px-5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    Créer la tâche
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;