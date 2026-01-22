import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";

export default function NotificationButton() {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative cursor-pointer" title={`${unreadCount} notification(s) non lue(s)`}>
      <Link to="/notifications">
        <span style={{ fontSize: "1.5rem" }}>🔔</span>
      </Link>

      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            backgroundColor: "#dc2626", 
            color: "white",
            borderRadius: "50%",
            padding: "0 6px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            lineHeight: "1.5",
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
}
