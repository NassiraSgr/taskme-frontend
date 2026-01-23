import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import NotificationButton from "./NotificationButton";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({
  name,
  setName,
  role,
  setUser,
  setRole,
}: {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { theme } = useTheme();
  const [loggedOut, setLoggedOut] = useState(false);
  const [isopen, setIsopen] = useState(false);

  const logout = async () => {
    await fetch("https://taskme-backend-wt4m.onrender.com/api/logout", {
      method: "GET",
      credentials: "include",
    });
    setName("");
    setRole("");
    setUser(null);
    setLoggedOut(true);
  };

  if (loggedOut) return <Navigate to="/login" />;

  const navbarClass =
    theme === "dark"
      ? "navbar navbar-expand-lg navbar-dark bg-dark"
      : "navbar navbar-expand-lg navbar-light bg-body";

  if (!name) {
    return (
      <nav className={navbarClass}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">TaskMe</Link>
          <ul className="navbar-nav">
            <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className={navbarClass}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">TaskMe</Link>
        <button className="navbar-toggler" onClick={() => setIsopen(!isopen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isopen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/tasks">Tâches</Link></li>
            {role==='COORDINATEUR' && <li className="nav-item"><Link className="nav-link" to="/addTask">Créer Tâche</Link></li>}
            {(role === "SUPER_ADMIN" || role === "COORDINATEUR") && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/userManagement">Utilisateurs</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/vehiculeManagement">Gestion des Vehicules</Link></li>
              </>
            )}
          </ul>

          <div className="position-relative me-3">
            <NotificationButton />
          </div>

          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{name}</a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link to="/dashboard" className="dropdown-item">Profil</Link></li>
                <li><Link to="/historique" className="dropdown-item">Historique</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
              </ul>
            </li>
          </ul>

          <div className="ms-3"><ThemeToggle /></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
