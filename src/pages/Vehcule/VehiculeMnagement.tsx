import { log } from "console";
import React, { useEffect, useState } from "react";


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
  ville:string;
}

interface AssignForm {
  taskId: string;
  dateDebut: string;
  dateFin: string;
  taskTitle: string;
}

const VehicleManagement = ({userRole}:{userRole:string}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    immatriculation: "",
    marque: "",
    modele: "",
    annee: "",
    disponible: true,
    description: "",
    ville:""
  });

  const [filterDates, setFilterDates] = useState({ dateDebut: "", dateFin: "" ,ville:''});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignVehicle, setAssignVehicle] = useState<Vehicle | null>(null);
  const [assignForm, setAssignForm] = useState<AssignForm>({
    taskId: "",
    dateDebut: "",
    dateFin: "",
    taskTitle:''
  });

  const [tasks, setTasks] = useState<{ _id: string; nom: string;vehiculeRequis:boolean }[]>([]);

  // get lesvehicules
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/vehicles", { 
        headers:{'Content-Type' : 'application/json'},
        credentials: "include" 
      })
      if(!res.ok) return 
      const data: { vehicles: Vehicle[] } = await res.json();
      // console.log('jjjjjj',data.vehicles);
      
      setVehicles(data.vehicles)
      setFilteredVehicles(data.vehicles)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // get les taches (pour assignation)
  const fetchTasks = async () => {
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/tasks", 
        { 
          headers:{'Content-Type' : 'application/json'},
          credentials: "include" 
        })
      if(!res.ok) return 
      const data = await res.json();
      setTasks(data.date)
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchTasks();
  }, []);

  // les operations de creation et modification 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      if (!data.success) return alert(data.message || "Erreur");

      fetchVehicles();
      setForm({ immatriculation: "", marque: "", modele: "", annee: "", disponible: true, description: "",ville:'' });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) return;
    try {
      await fetch(`https://taskme-backend-wt4m.onrender.com/api/vehicles/${id}`, { 
        method: "DELETE", 
        credentials: "include" 
      })
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  
  const handleEdit = (v: Vehicle) => {
    setEditingId(v._id);
    setForm({ immatriculation: v.immatriculation, marque: v.marque, modele: v.modele, annee: v.annee, disponible: v.disponible, description: v.description ?? "",ville: v.ville });
  };

  // Filtrer par disponibilité
  const filterAvailable = async () => {
    if (!filterDates.dateDebut || !filterDates.dateFin) return setFilteredVehicles(vehicles);

    try {
      const res = await fetch(
        `https://taskme-backend-wt4m.onrender.com/api/vehicles/available?dateDebut=${filterDates.dateDebut}&dateFin=${filterDates.dateFin}&ville=${filterDates.ville}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setFilteredVehicles(data.vehicles);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
  if (!assignVehicle) return;
  
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
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    const data = await res.json();
    // console.log('Response data:', data);
    
    if (!res.ok) {
      console.error('Erreur serveur:', data);
      alert(data.message || `${res.status}: ${res.statusText}`);
      return;
    }
    
    if (!data.success) {
      console.error('Success false:', data.message);
      alert(data.message || "Erreur lors de l'affectation du véhicule");
      return;
    }
    
    console.log('succes');
    setShowAssignModal(false);
    fetchVehicles();
    
  } catch (err) {
    console.error('Erreur catch:', err);
    alert('Erreur de connexion au serveur');
  }
};
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Gestion des véhicules</h1>

      {userRole === 'SUPER_ADMIN' && (
        <form onSubmit={handleSubmit}
        className="bg-body border border-gray-200 rounded-xl p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingId ? "Modifier le véhicule" : "Ajouter un véhicule"}
          </h2>
          {editingId && (
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Édition
            </span>
          )}
        </div>

        <div className="row g-3">
          <input
            className="form-control"
            placeholder="Immatriculation"
            value={form.immatriculation}
            onChange={e => setForm({ ...form, immatriculation: e.target.value })}
            required
          />

          <input
            className="form-control"
            placeholder="Marque"
            value={form.marque}
            onChange={e => setForm({ ...form, marque: e.target.value })}
            required
          />

          <input
            className="form-control"
            placeholder="Modèle"
            value={form.modele}
            onChange={e => setForm({ ...form, modele: e.target.value })}
            required
          />

          <input
            type="number"
            className="form-control"
            placeholder="Année"
            value={form.annee}
            onChange={e => setForm({ ...form, annee: Number(e.target.value) || "" })}
            required
          />

          <input
            className="form-control"
            placeholder="Ville"
            value={form.ville}
            onChange={e => setForm({ ...form, ville: e.target.value })}
            required
          />
          {/* lors de creation de vehicule , cette derniere est par defaut disponible mais lorsque le coordinateur affecte la vehicule a une tache l'admin va recevoir une notification dont lequel il peut changer l'etat de vehicule a indisponible */}
          <select
            className="form-control"
            value={String(form.disponible)}
            onChange={e =>
              setForm({ ...form, disponible: e.target.value === "true" })
            }
          >
            <option value="true">Disponible</option>
            <option value="false">Indisponible</option>
          </select>

          <input
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg text-white text-sm font-medium
              ${editingId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
      )}



      {/* Filtre disponibilité */}
    <div className="bg-body border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
      <span className="text-sm font-medium text-gray-700">
        Filtrer par date
      </span>

      <input
        type="date"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        value={filterDates.dateDebut}
        onChange={e =>
          setFilterDates({ ...filterDates, dateDebut: e.target.value })
        }
      />

      <input
        type="date"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        value={filterDates.dateFin}
        onChange={e =>
          setFilterDates({ ...filterDates, dateFin: e.target.value })
        }
      />
      <select
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        value={filterDates.ville}
        onChange={e => setFilterDates({ ...filterDates, ville: e.target.value })}
      >
        <option value="">Toutes les villes</option>
        {Array.from(new Set(vehicles.map(v => v.ville))).map(ville => (
          <option key={ville} value={ville}>{ville}</option>
        ))}
      </select>


      <button
        onClick={filterAvailable}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
      >
        Filtrer
      </button>
    </div>



      {/* Tableau véhicules */}
     <div className="table-responsive ">
      <table className="table table-hover align-middle">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">Immatriculation</th>
            <th className="px-4 py-3 text-left">Marque</th>
            <th className="px-4 py-3 text-left">Modèle</th>
            <th className="d-none d-sm-table-cell">Année</th>
            <th className="px-4 py-3 text-left">Disponible</th>
            <th className="d-none d-md-table-cell">Occupations</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredVehicles.map(v => (
            <tr
              key={v._id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">{v.immatriculation}</td>
              <td className="px-4 py-3">{v.marque}</td>
              <td className="px-4 py-3">{v.modele}</td>
              <td className="d-none d-sm-table-cell">{v.annee}</td>
              <td className="px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.disponible
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"}`} >
                  {v.disponible ? "Oui" : "Non"}
                </span>
              </td>
              <td className="d-none d-md-table-cell">
                {v.occupations?.map((o, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded px-2 py-1 text-xs"
                  >
                    {o.taskTitle} ({o.start.split("T")[0]} → {o.end.split("T")[0]})
                  </div>
                ))}
              </td>
              <td className="px-4 py-3 space-y-1">
                {userRole === 'SUPER_ADMIN' && (
                  <>
                  <button onClick={() => handleEdit(v)} className="btn btn-light w-100 text-secondary">
                    Modifier
                  </button>

                  <button onClick={() => handleDelete(v._id)} className="btn btn-outline-danger w-100">
                    Supprimer
                  </button>
                </>
                )}
                {userRole === 'COORDINATEUR' && (
                  <button onClick={() => {setAssignVehicle(v); setShowAssignModal(true);}}
                  className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs">
                  Assigner
                </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>



      {/* Modal assignation */}
    {userRole==='COORDINATEUR' && showAssignModal && assignVehicle && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
        style={{ zIndex: 1055 }}
      >
        <div className="bg-body rounded shadow p-4 w-75">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Assigner le véhicule</h5>
              <span className="badge bg-primary">
                {assignVehicle.immatriculation}
              </span>
            </div>
            <button
              className="btn-close"
              onClick={() => setShowAssignModal(false)}
            />
          </div>

          {/* Body */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Tâche
            </label>
            <select
              className="form-select"
              value={assignForm.taskId}
              onChange={(e) =>{
                const selectedTask = tasks.find(t => t._id === e.target.value);
                setAssignForm({ ...assignForm, taskId: e.target.value,taskTitle:selectedTask?.nom ||'' })
              }
                
              }
            >
              <option value="">Sélectionner une tâche</option>
              {tasks.filter(t=> t.vehiculeRequis===true).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Date début
              </label>
              <input
                type="date"
                className="form-control"
                value={assignForm.dateDebut}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, dateDebut: e.target.value })
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Date fin
              </label>
              <input
                type="date"
                className="form-control"
                value={assignForm.dateFin}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, dateFin: e.target.value })
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowAssignModal(false)}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAssign}
            >
              Assigner
            </button>
          </div>
        </div>
      </div>
)}



    </div>
  );
};

export default VehicleManagement;
