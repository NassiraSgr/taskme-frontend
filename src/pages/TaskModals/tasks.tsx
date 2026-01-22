import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<Boolean>(false)

  useEffect(() => {
    (async () => {
        setLoading(true)
      try {
        const res = await fetch('http://localhost:3000/api/tasks', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials:'include'
        });

        if (!res.ok) throw new Error('Erreur lors de la récupération des tâches');

        const data = await res.json();
        const sortedTasks = data.date.sort((a: any, b: any) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

        setTasks(sortedTasks);
        if (!data.date || data.date.length === 0) {
          setMessage("Aucune tâche n'est trouvée");
        }
      } catch (err) {
        console.error(err);
        setMessage("Impossible de charger les tâches");
      }
      setLoading(false)
    })();

    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) return;

        const data = await res.json();
        setRole(data.data.role);
        setUser(data.data);
      } catch (err) {
        console.error('Erreur lors de récupération de l’utilisateur:', err);
      }
    })();
  }, []);

  const handleDelete = async (_id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/task/${_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      console.log(res);
      
      if (!res.ok) throw new Error('Erreur lors de la suppression de la tâche');
      const data = await res.json();
      // on supprimer la tâche localement pour rafraîchir l'affichage
      setTasks(prev => prev.filter(task => task._id !== _id));
      alert('Tâche supprimée avec succès');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Les tâches ajoutées</h2>
    {loading && (<div>Chargement.....</div>)}
      {tasks.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {tasks.map(task => (
            <div className="col" key={task._id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{task.nom || task.title}</h5>
                  {task.specialites && 
                    <small className="card-subtitle mb-2 text-muted">
                      <strong>Specialite:</strong> {task.specialites.map((s:string) => <span key={s}>{s} </span>)}
                    </small>
                  }

                  <p className="card-text flex-grow-1">
                    {task.description?.length > 100
                      ? task.description.substring(0, 100) + '...'
                      : task.description}
                  </p>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Link to={`/tasks/${task._id}`} className="btn btn-primary btn-sm">
                      Voir détails
                    </Link>
                    {(role === "SUPER_ADMIN" || role === "COORDINATEUR") && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(task._id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center mt-4">{message}</div>
      )}
    </div>
  );
};

export default Tasks;
