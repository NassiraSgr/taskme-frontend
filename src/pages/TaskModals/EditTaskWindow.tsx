import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const EditTaskWindow = () => {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    type: "",
    dateDebut: "",
    dateFin: "",
    remuneree: false,
    nombrePlaces: 0,
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${id}`);
      const data = await res.json();
      setTask(data.data);

      setForm({
        nom: data.data.nom,
        description: data.data.description,
        type: data.data.type,
        dateDebut: data.data.dateDebut?.slice(0, 10),
        dateFin: data.data.dateFin?.slice(0, 10),
        remuneree: data.data.remuneree,
        nombrePlaces: data.data.nombrePlaces,
      });
    })();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`https://taskme-backend-wt4m.onrender.com/api/task/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials:'include',
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      alert("Tâche modifiée avec succès");
      window.close();
    } else {
      alert("Erreur lors de la modification");
    }
  };

  if (!task) return <div>Chargement...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Modifier la tâche</h2>

      <form onSubmit={handleSubmit}>
        <label>Nom:</label>
        <input
          className="form-control"
          value={form.nom}
          onChange={(e) => handleChange("nom", e.target.value)}
        />

        <label>Description:</label>
        <textarea
          className="form-control"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <label>Type:</label>
        <select
          className="form-control"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <option value="FORMATEUR">Formateur</option>
          <option value="MEMBRE_JURY">Jury</option>
          <option value="BENEFICIAIRE">Bénéficiaire</option>
          <option value="OBSERVATEUR">Observateur</option>
          <option value="CONCEPTEUR_EVALUATION">Concepteur d’évaluation</option>
        </select>

        <label>Date début:</label>
        <input
          type="date"
          className="form-control"
          value={form.dateDebut}
          onChange={(e) => handleChange("dateDebut", e.target.value)}
        />

        <label>Date fin:</label>
        <input
          type="date"
          className="form-control"
          value={form.dateFin}
          onChange={(e) => handleChange("dateFin", e.target.value)}
        />

        <label>Rémunérée:</label>
        <input
          type="checkbox"
          checked={form.remuneree}
          onChange={(e) => handleChange("remuneree", e.target.checked)}
        />

        <label>Nombre de places:</label>
        <input
          type="number"
          className="form-control"
          value={form.nombrePlaces}
          onChange={(e) =>
            handleChange("nombrePlaces", e.target.valueAsNumber)
          }
        />

        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};

export default EditTaskWindow;
