import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const UsersManagement = ({userId}:{userId:string}) => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "AUDITEUR",
    specialite: "PEDAGOGIQUE",
    grade: "A",
    diplomes: "",
    formations: "",
    anciennete: 0,
    actif: false,
  });

  
  const loadUsers = async () => {
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/users", {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Impossible de charger les utilisateurs");
    }
  };

 

  useEffect(() => {
    loadUsers();
  }, []);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      specialite: formData.specialite,
      grade: formData.grade,
      diplomes: formData.diplomes.split("\n").filter(Boolean),
      formations: formData.formations.split("\n").filter(Boolean),
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
        setMessage(errorData.message || "Erreur lors de la modification");
        return;
      }

      setMessage("Utilisateur modifié avec succès");
      setEditingId(null);
      resetForm();
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("Impossible de contacter le serveur");
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
      diplomes: user.diplomes.join("\n"),
      formations: user.formations.join("\n"),
      anciennete: user.anciennete,
      actif: user.actif,
    });
  };


  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await fetch(`https://taskme-backend-wt4m.onrender.com/api/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setMessage("Utilisateur supprimé avec succès");
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la suppression");
    }
  };

  
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "AUDITEUR",
      specialite: "PEDAGOGIQUE",
      grade: "A",
      diplomes: "",
      formations: "",
      anciennete: 0,
      actif: true,
    });
  }

  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }
}, [message])



  return (
    <div className="container mt-4">
      <h3 className="mb-4">Gestion des utilisateurs</h3>

      {/* FORMULAIRE MODIFICATION */}
      {editingId && (
        <form className="card p-4 mb-4" onSubmit={handleSubmit}>
          <h5 className="mb-3">Modifier utilisateur</h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Prénom</label>
              <input
                className="form-control"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Nom</label>
              <input
                className="form-control"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Rôle</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="AUDITEUR">Auditeur</option>
                <option value="COORDINATEUR">Coordinateur</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Spécialité</label>
              <select
                className="form-select"
                value={formData.specialite}
                onChange={(e) =>
                  setFormData({ ...formData, specialite: e.target.value })
                }
              >
                <option value="PEDAGOGIQUE">Pédagogique</option>
                <option value="ORIENTATION">Orientation</option>
                <option value="PLANIFICATION">Planification</option>
                <option value="FINANCIER">Financier</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Grade</label>
              <select
                className="form-select"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Ancienneté (années)</label>
            <input
              type="number"
              className="form-control"
              value={formData.anciennete}
              onChange={(e) =>
                setFormData({ ...formData, anciennete: Number(e.target.value) })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Diplômes (1 par ligne)</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.diplomes}
              onChange={(e) =>
                setFormData({ ...formData, diplomes: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Formations (1 par ligne)</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.formations}
              onChange={(e) =>
                setFormData({ ...formData, formations: e.target.value })
              }
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={formData.actif}
              onChange={(e) =>
                setFormData({ ...formData, actif: e.target.checked })
              }
            />
            <label className="form-check-label">Compte actif</label>
          </div>

          <button className="btn btn-primary">Mettre à jour</button>
          <button className="btn btn-sm btn-secondary mt-2" onClick={() => setEditingId(null)}>Annuler</button>
        </form>
      )}

      {message && <div className="alert alert-success text-center">{message}</div>}

      {/* TABLE UTILISATEURS */}
      <div className="overflow-x-auto"></div>
      <table className="min-w-full bg-body border rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nom</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Rôle</th>
            <th className="px-4 py-2 text-left">Spécialité</th>
            <th className="px-4 py-2 text-left">Grade</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
            <th className="px-4 py-2 text-left">Envoyer Message</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(us=>(us._id !== userId && us.role !=='SUPER_ADMIN' )).map((u) => (
            <tr key={u._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">
                {u.firstName} {u.lastName}
              </td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2">{u.specialite}</td>
              <td className="px-4 py-2">{u.grade}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-white ${u.actif ? 'bg-green-600' : 'bg-gray-400'}`}
                >
                  {u.actif ? "Actif" : "Inactif"}
                </span>
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => handleEditUser(u)}
                >
                  Modifier
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  Supprimer
                </button>
              </td>
              <td className="px-4 py-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                  onClick={() => navigate(`/chat/direct/${u._id}`)}
                >
                  <MessageCircle size={16}/> Chat
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersManagement;

