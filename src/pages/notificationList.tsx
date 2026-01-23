import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";

export default function NotificationList() {
  const { notifications, markAsRead } = useNotifications();

  const handleDeleteAll = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer Tous les notifications ?")) return;
    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/notifications/delete", {
        method: "DELETE",
        credentials: "include",
      })
      console.log(res);
      
    if (!res.ok) throw new Error("Erreur lors de la suppression des notifications");
     

      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>

      {notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <>
          <button
            onClick={handleDeleteAll}
            className="btn btn-danger mb-3"
          >
            Supprimer toutes les notifications
          </button>
          <hr />
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-3 mb-2 rounded border ${
                n.read ? "bg-body-secondary" : "bg-primary-subtle"
              } text-body`}
              style={{ cursor: "pointer" }}
            >
              <strong>{n.title}</strong>
              <p className="text-body">{n.message}</p>
              {n.link && (
                <Link to={n.link} className="text-center">
                  Voir Details
                </Link>
              )}
              <br />
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
