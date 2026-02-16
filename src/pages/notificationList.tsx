import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function NotificationList() {
  const { notifications, markAsRead, unreadCount } = useNotifications();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDeleteAll = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer toutes les notifications ?")) return;
    
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("https://taskme-backend-wt4m.onrender.com/api/notifications/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression des notifications");

      setSuccessMessage("Toutes les notifications ont été supprimées avec succès");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Marquer toutes les notifications non lues comme lues
      const markAllAsRead = async () => {
        const promises = notifications
          .filter(n => !n.read)
          .map(n => markAsRead(n._id));
        
        await Promise.all(promises);
      };
      
      await markAllAsRead();
      setSuccessMessage("Toutes les notifications ont été marquées comme lues");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Erreur lors du marquage des notifications");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 text-blue-600">🔔</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : "Toutes vos notifications sont lues"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Messages d'alerte */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Boutons d'action */}
          {notifications.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${unreadCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                `}
              >
                Tout marquer comme lu
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isDeleting
                    ? 'bg-red-400 cursor-wait'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                `}
              >
                {isDeleting ? 'Suppression...' : 'Tout supprimer'}
              </button>
            </div>
          )}
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="text-2xl text-gray-400">🔔</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Vous êtes à jour ! Vous serez notifié ici lorsque de nouvelles activités seront disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className={`
                  group relative p-4 rounded-xl border cursor-pointer
                  transition-all duration-200 hover:shadow-md
                  ${notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                  }
                `}
              >
                {/* Indicateur non lu */}
                {!notification.read && (
                  <div className="absolute left-4 top-4 w-2 h-2 bg-blue-500 rounded-full" />
                )}

                <div className="ml-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p className={`mb-3 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>

                  {notification.link && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <Link
                        to={notification.link}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Voir les détails
                      </Link>
                      
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="text-sm text-gray-500 hover:text-blue-600"
                          title="Marquer comme lu"
                        >
                          ✓ Marquer comme lu
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {notifications.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>{notifications.length - unreadCount} lue{notifications.length - unreadCount > 1 ? 's' : ''}</span>
              </div>
              <div className="ml-auto">
                <span>Total : {notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}