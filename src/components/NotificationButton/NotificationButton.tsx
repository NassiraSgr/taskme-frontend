import { useNotifications } from "../../context/NotificationContext";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function NotificationButton() {
  const { unreadCount } = useNotifications();

  const notificationTitle = unreadCount === 0 
    ? "Aucune notification" 
    : `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`;

  return (
    <Link 
      to="/notifications" 
      className="relative inline-flex items-center justify-center p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={notificationTitle}
      title={notificationTitle}
    >
      <Bell 
        className={`w-6 h-6 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400 animate-pulse-once' : 'text-gray-700 dark:text-gray-300'}`}
        strokeWidth={unreadCount > 0 ? 2 : 1.5}
      />
      
      {unreadCount > 0 && (
        
          <span 
            className={`
              flex items-center justify-center min-w-[22px] h-6 px-1.5
              text-xs font-bold 
              bg-red-600 dark:bg-red-700
              
              rounded-full 
              border-2 border-white dark:border-gray-800
              shadow-lg shadow-red-500/30 dark:shadow-red-900/50
              ${unreadCount > 99 ? 'text-[10px] px-1' : ''}
              animate-pulse-once
            `}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
      )}
    </Link>
  );
}