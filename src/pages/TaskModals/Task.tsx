import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  ville:string;
  commune: boolean;
  specialites: string[];
  grades: string[];
  nombrePlaces: number;
  adminFile?: string;
  affectations?: any[];
}

const allSpecialites = ["PEDAGOGIQUE", "ORIENTATION", "PLANIFICATION", "FINANCIER"];
const allGrades = ["A", "B", "C"];
const allTypes = ["FORMATEUR","MEMBRE_JURY","BENEFICIAIRE","OBSERVATEUR","CONCEPTEUR_EVALUATION"];
const allLignes = ["RABAT_CASA", "MEKNES_ERRACHIDIA", "MARRAKECH_AGADIR"];

const Task = ({ userRole, userId }: { userRole: string, userId: string }) => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskModel | null>(null);
  const [userAffectation, setUserAffectation] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const formatDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];
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
    ville:'',
    commune: false,
    nombrePlaces: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${id}`,{
          credentials:'include'
        });
        if (!res.ok) return;
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
        setMessage("Impossible de charger cette tache.");
      }
    })();
  }, [id]);

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
      if (!res.ok) console.log('Erreur de modification');
      const data = await res.json();
      setTask(data.data);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAffectation = async (statut: string) => {
    if (!userAffectation) return;
    const justification = statut === "refuse" ? prompt("Raison du refus") || "" : "";
    try {
      await fetch(`https://taskme-backend-wt4m.onrender.com/api/affectations/${userAffectation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, justification }),
        credentials:'include'
      });
      setUserAffectation((prev :any)=> ({ ...prev, statut }));
      alert(`Tâche ${statut}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!task) return <div>Chargement...</div>;

  return (
    <>
    {message && 
      <div>{message}</div>
    }
    <div className="container mt-4">
      <div className="card shadow-sm text-center">
        <div className="card-body">
          <h3>{task.nom}</h3>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Type:</strong> {task.type}</p>
          <p><strong>Dates:</strong>   {formatDate(task.dateDebut)} - {formatDate(task.dateFin)}</p>
          <p><strong>Rémunérée:</strong> {task.remuneree ? "Oui" : "Non"}</p>
          {task.remuneree && <p><strong>Prix:</strong> {task.prixRemuneree} DH</p>}
          <p><strong>Véhicule:</strong> {task.vehiculeRequis ? "Oui" : "Non"}</p>
          <p><strong>Commune:</strong> {task.commune ? "Oui" : "Non"}</p>
          {task.vehiculeRequis && <p><strong>Ligne:</strong> {task.ligne}</p>}
          {task.vehiculeRequis && <p><strong>Ville:</strong> {task.ville}</p>}                    
          <p><strong>Spécialités:</strong> {task.specialites.map(s => <span key={s} className="badge bg-primary me-1">{s}</span>)}</p>
          <p><strong>Grades:</strong> {task.grades.map(g => <span key={g} className="badge bg-secondary me-1">Grade {g}</span>)}</p>
          <p><strong>Places:</strong> {task.nombrePlaces}</p>

          {task.adminFile && (
            <div className="mt-3">
              <h6>Document associé :</h6>
              <a
                href={`https://taskme-backend-wt4m.onrender.com/${task.adminFile}`}
                download
                className="btn btn-outline-primary mb-3"
              >
                Télécharger le fichier
              </a>
              {/* {task.adminFile.endsWith(".pdf") && (
                <iframe
                  src={`https://taskme-backend-wt4m.onrender.com/${task.adminFile}`}
                  width="100%"
                  height="600px"
                  style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                />
              )} */}
            </div>
          )}

          {(userRole === "SUPER_ADMIN" || userRole === "COORDINATEUR") &&
            <button className="btn btn-primary mb-3" onClick={() => setShowEditModal(true)}>Modifier</button>
          }

          {showEditModal && (
            <div
              className="modal-overlay"
              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
              onClick={() => setShowEditModal(false)}
            >
              <div
                className="modal-box bg-body p-4 rounded"
                style={{ width: "600px", maxHeight: "90%", overflowY: "auto" }}
                onClick={e => e.stopPropagation()}
              >
                <h5>Modifier la tâche</h5>
                <div className="mb-3">
                  <label>Nom</label>
                  <input className="form-control" value={editedData.nom} onChange={e => handleChange("nom", e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Description</label>
                  <textarea className="form-control" value={editedData.description} onChange={e => handleChange("description", e.target.value)} />
                </div>
                <div className="mb-3">
                  <label>Type</label>
                  <select className="form-select" value={editedData.type} onChange={e => handleChange("type", e.target.value)}>
                    {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <label>Date début</label>
                    <input type="date" className="form-control" value={editedData.dateDebut} onChange={e => handleChange("dateDebut", e.target.value)} />
                  </div>
                  <div className="col">
                    <label>Date fin</label>
                    <input type="date" className="form-control" value={editedData.dateFin} onChange={e => handleChange("dateFin", e.target.value)} />
                  </div>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={editedData.remuneree} onChange={e => handleChange("remuneree", e.target.checked)} />
                  <label className="form-check-label">Rémunérée</label>
                </div>
                {editedData.remuneree && (
                  <div className="mb-3">
                    <label>Prix</label>
                    <input type="number" className="form-control" value={editedData.prixRemuneree} onChange={e => handleChange("prixRemuneree", e.target.valueAsNumber)} />
                  </div>
                )}
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" checked={editedData.vehiculeRequis} onChange={e => handleChange("vehiculeRequis", e.target.checked)} />
                  <label className="form-check-label">Necessite Vehicule</label>
                </div>
                {editedData.vehiculeRequis && (
                    <div className="mb-3">
                      <label>Ville</label>
                      <input type="text" className="form-control" value={editedData.ville} onChange={e => handleChange("ville", e.target.value)} />
                    </div>
                )
                }

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
                </div>
              </div>
            </div>
          )}

          {userAffectation && userAffectation.statut === "en_attente" && (
            <div className="mt-3">
              <button className="btn btn-success me-2" onClick={() => handleAffectation("accepte")}>Accepter</button>
              <button className="btn btn-danger" onClick={() => handleAffectation("refuse")}>Refuser</button>
            </div>
          )}

          {userAffectation && userAffectation.statut !== "en_attente" && (
            <p className="mt-3"><strong>Statut :</strong> {userAffectation.statut === "accepte" ? "Acceptée" : "Refusée"}</p>
          )}
        </div>
      </div>
    </div>
    </>
    
  );
};

export default Task;
