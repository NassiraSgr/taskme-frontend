import {  useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
    const Navigate = useNavigate();

    const [title, setTitle] =useState<string | ''>('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('FORMATEUR')
    const [dateDebut, setdateDebut] = useState('')
    const [dateFin, setdateFin] = useState('')
    const [isPaid, setIsPaid] = useState(false)
    const [prixRemuneree, setPrixRemuneree] = useState<number | ''>(0)
    const [vehiculeRequis, setVehiculeRequis] = useState(false)
    const [specialites, setspecialites] = useState<string[]>([])
    const [grades, setgrades] = useState<string[]>([])
    const [ligne, setLigne] = useState<string | ''>('RABAT_CASA')
    const [estCommune, setEstCommune] = useState(false)
    const [adminFile, setAdminFile] = useState<File | null>(null)
    const [numberOfPlaces, setNumberOfPlaces] = useState(1)
    const [ville,  setVille] = useState('')
    const [succes, setsucces] = useState<string | ''>('');
    const [error, setError] = useState<string | ''>('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("nom", title);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("dateDebut", dateDebut);
        formData.append("dateFin", dateFin);
        formData.append("remuneree", String(isPaid));
        formData.append("prixRemuneree", String(prixRemuneree));
        formData.append("estCommune", String(estCommune));
        formData.append("vehiculeRequis", String(vehiculeRequis));
        formData.append("ligne", ligne);
        formData.append("ville",ville);
        formData.append("nombrePlaces", String(numberOfPlaces));

        specialites.forEach(s => formData.append("specialites[]", s));
        grades.forEach(g => formData.append("grades[]", g));

        if (adminFile) {
          formData.append("adminFile", adminFile); 
        }

        const response = await fetch("https://taskme-backend-wt4m.onrender.com/api/addTask", {
          method: "POST",
          credentials: "include",
          body: formData,    
        });

        if (!response.ok) {
          setError("Erreur lors de la création de la tâche");
          return;
        }

        const data = await response.json();
        console.log("data ....", data);

        setsucces("Tâche créée avec succès !");
        setTimeout(() => {
          Navigate("/tasks");
        }, 2000);
      };

    
    return (
    <div className="container mt-4">
      <h3 className="mb-4">Créer une tâche</h3>

      <form className="text-start" onSubmit={handleSubmit}>
            
       
        {/* NOM */}
        <div className="mb-3">
          <label className="form-label">Nom de la tâche</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nom de la tâche"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* TYPE */}
        <div className="mb-3">
          <label className="form-label">Type</label>
          <select className="form-select" onChange={(e) => setType(e.target.value)}>
            <option value="FORMATEUR">Formateur</option>
            <option value="MEMBRE_JURY">Jury</option>
            <option value="BENEFICIAIRE">Bénéficiaire</option>
            <option value="OBSERVATEUR">Observateur</option>
            <option value="CONCEPTEUR_EVALUATION">Concepteur d’évaluation</option>
          </select>
        </div>

        {/* DATES */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Date de début</label>
            <input type="date" className="form-control" required value={dateDebut} onChange={(e) =>setdateDebut(e.target.value)} />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Date de fin</label>
            <input type="date" className="form-control" required value={dateFin} onChange={(e) =>setdateFin(e.target.value)} />
          </div>
        </div>

        {/* RÉMUNÉRATION */}
        <div className="mb-3">
          <label className="form-label d-block">Tâche rémunérée</label>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="remuneration"
              checked={isPaid === true}
              onChange={() => setIsPaid(true)}
            />
            <label className="form-check-label">Oui</label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="remuneration"
              checked={isPaid === false}
              onChange={() => {
                setIsPaid(false);
                setPrixRemuneree("");
              }}
            />
            <label className="form-check-label">Non</label>
          </div>
        </div>

        {/* PRIX RÉMUNÉRATION */}
        {isPaid && (
          <div className="mb-3">
            <label className="form-label">Prix de rémunération</label>
            <input
              type="number"
              className="form-control"
              min={0}
              value={prixRemuneree}
              onChange={(e) =>
                setPrixRemuneree(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>
        )}

        {/* VÉHICULE */}
        

        {/* EST COMMUNE */}
        <div className="mb-4">
          <label className="form-label d-block">Type de tâche</label>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="estCommune"
              checked={estCommune === true}
              onChange={() => setEstCommune(true)}
            />
            <label className="form-check-label">Commune</label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="estCommune"
              checked={estCommune === false}
              onChange={() => setEstCommune(false)}
            />
            <label className="form-check-label">Particulière</label>
          </div>
        </div>

        {/* SPÉCIALITÉS */}
        <div className="mb-3">
          <label className="form-label">Spécialités concernées</label>
          <div>
            {["PEDAGOGIQUE", "ORIENTATION", "PLANIFICATION", "FINANCIER"].map(
              (s) => (
                <div className="form-check form-check-inline" key={s}>
                  <input className="form-check-input" type="checkbox" checked={specialites.includes(s)} onChange={(e) => {
                    if (e.target.checked) {
                      setspecialites([...specialites, s]);
                    } else {
                      setspecialites(specialites.filter(spec => spec !== s));
                    }
                  }} />
                  <label className="form-check-label">{s}</label>
                </div>
              )
            )}
          </div>
        </div>

        {/* grades */}
        <div className="mb-3">
          <label className="form-label">grades concernés</label>
          <div>
            {["A", "B", "C"].map((g) => (
              <div className="form-check form-check-inline" key={g}>
                <input className="form-check-input" type="checkbox" checked={grades.includes(g)} onChange={(e) => {
                  if (e.target.checked) {
                    setgrades([...grades, g]);
                  } else {
                    setgrades(grades.filter(grade => grade !== g));
                  }
                }} />
                <label className="form-check-label">Grade {g}</label>
              </div>
            ))}
          </div>
        </div>
        {/* VEHICULE */}
        <div className="mb-3">
          <label className="form-label d-block">Véhicule nécessaire</label>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="vehicle"
              checked={vehiculeRequis === true}
              onChange={() => setVehiculeRequis(true)}
            />
            <label className="form-check-label">Oui</label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="vehicle"
              checked={vehiculeRequis === false}
              onChange={() => setVehiculeRequis(false)}
            />
            <label className="form-check-label">Non</label>
          </div>
        </div>
        {/* LIGNE */}
       {vehiculeRequis && <div className="mb-3">
          <label className="form-label">Ligne</label>
          <select className="form-select" onChange={(e) => setLigne(e.target.value)}>
            <option value="RABAT_CASA">Rabat – Casa</option>
            <option value="MEKNES_ERRACHIDIA">Meknès – Errachidia</option>
            <option value="MARRAKECH_AGADIR">Marrakech – Agadir</option>
          </select>
        </div>}
        {vehiculeRequis && <div className="mb-3">
          <label className="form-label">Ville de Direction</label>
          <input
            type="text"
            className="form-control"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>}

        {/* FICHIER ADMIN */}
        <div className="mb-3">
          <label className="form-label">Fichier administratif (PDF)</label>
          <input
            type="file"
            className="form-control"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setAdminFile(e.target.files[0]);
              } else {
                setAdminFile(null);
              } }}
          />
        </div>

        {/* PLACES */}
        <div className="mb-4">
          <label className="form-label">Nombre de places</label>
          <input
            type="number"
            className="form-control"
            min={1}
            value={numberOfPlaces}
            required
            onChange={(e) => setNumberOfPlaces(e.target.valueAsNumber)}
          />
        </div>

        <button className="btn btn-primary w-100">
          Créer la tâche
        </button>
        {
                succes && <div className="alert alert-success mt-2">{succes}</div>
        }
        {
          error && <div className="alert alert-danger mt-2">{error}</div>
        }
      </form>
    </div>
  );
};

export default CreateTask;
