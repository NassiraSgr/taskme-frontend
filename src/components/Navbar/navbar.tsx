import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  Home,
  ListTodo,
  PlusCircle,
  Users,
  Car,
  LayoutDashboard,
  History,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import NotificationButton from '../NotificationButton/NotificationButton';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import './navbar.css';

interface LayoutProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode; // IMPORTANT: Pour afficher le contenu des pages
}

const Navbar = ({
  name,
  setName,
  role,
  setUser,
  setRole,
  children,
}: LayoutProps) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [loggedOut, setLoggedOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer la sidebar mobile et dropdown lors du changement de page
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setName('');
      setRole('');
      setUser(null);
      setLoggedOut(true);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loggedOut) return <Navigate to="/login" />;

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return { label: 'Admin', color: 'role-admin', icon: '👑' };
      case 'COORDINATEUR':
        return { label: 'Coordinateur', color: 'role-coordinator', icon: '⭐' };
      case 'AUDITEUR':
        return { label: 'Auditeur', color: 'role-auditor', icon: '✓' };
      default:
        return { label: userRole, color: 'role-default', icon: '👤' };
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Navbar pour utilisateurs non connectés
  if (!name) {
    return (
      <>
        <div className={`guest-navbar ${theme}`}>
          <div className="guest-container">
            <Link className="guest-brand" to="/">
              <div className="brand-icon">T</div>
              <span className="brand-text">TaskMe</span>
            </Link>

            <div className="guest-actions">
              <Link className="btn-outlined" to="/login">
                Connexion
              </Link>
              <Link className="btn-primary" to="/register">
                S'inscrire
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div style={{ paddingTop: '80px' }}>{children}</div>
      </>
    );
  }

  const roleBadge = getRoleBadge(role);

  const sidebarLinks = [
    { path: '/', label: 'Accueil', icon: <Home size={20} />, show: true },
    {
      path: '/tasks',
      label: 'Tâches',
      icon: <ListTodo size={20} />,
      show: true,
    },
    {
      path: '/addTask',
      label: 'Créer Tâche',
      icon: <PlusCircle size={20} />,
      show: role === 'COORDINATEUR',
    },
    {
      path: '/userManagement',
      label: 'Utilisateurs',
      icon: <Users size={20} />,
      show: role === 'SUPER_ADMIN' || role === 'COORDINATEUR',
    },
    {
      path: '/vehiculeManagement',
      label: 'Véhicules',
      icon: <Car size={20} />,
      show: role === 'SUPER_ADMIN' || role === 'COORDINATEUR',
    },
  ];

  const userMenuLinks = [
    {
      path: '/dashboard',
      label: 'Tableau de Bord',
      icon: <LayoutDashboard size={18} />,
    },
    { path: '/historique', label: 'Historique', icon: <History size={18} /> },
  ];

  return (
    <div className={`modern-layout ${theme}`}>
      {/* Sidebar Desktop */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link className="sidebar-brand" to="/">
            <div className="brand-icon-sidebar">T</div>
            {isSidebarOpen && (
              <span className="brand-text-sidebar">TaskMe</span>
            )}
          </Link>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks
            .filter((link) => link.show)
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                title={!isSidebarOpen ? link.label : ''}
              >
                <span className="sidebar-icon">{link.icon}</span>
                {isSidebarOpen && (
                  <span className="sidebar-label">{link.label}</span>
                )}
                {isActive(link.path) && <span className="active-indicator" />}
              </Link>
            ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Réduire' : 'Agrandir'}
          >
            <Menu size={20} />
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="sidebar mobile-sidebar open">
            <div className="sidebar-header">
              <Link className="sidebar-brand" to="/">
                <div className="brand-icon-sidebar">T</div>
                <span className="brand-text-sidebar">TaskMe</span>
              </Link>
              <button
                className="mobile-close"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="sidebar-nav">
              {sidebarLinks
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">{link.icon}</span>
                    <span className="sidebar-label">{link.label}</span>
                    {isActive(link.path) && (
                      <span className="active-indicator" />
                    )}
                  </Link>
                ))}
            </nav>

            <div className="mobile-user-section">
              {userMenuLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="mobile-user-link"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="mobile-divider" />
              <button className="mobile-logout" onClick={logout}>
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="topbar-breadcrumb">
              <span className="breadcrumb-text">
                {sidebarLinks.find((link) => isActive(link.path))?.label ||
                  'TaskMe'}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <div className="topbar-item">
              <NotificationButton />
            </div>

            {/* Theme Toggle */}
            <div className="topbar-item">
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <div className="user-info">
                  <span className="user-name">{name}</span>
                  <span className={`user-role ${roleBadge.color}`}>
                    {roleBadge.icon} {roleBadge.label}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`dropdown-chevron ${isUserDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="user-dropdown">
                  {userMenuLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="dropdown-link"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-link logout-link"
                    onClick={logout}
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - C'EST ICI QUE VOS PAGES S'AFFICHENT */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Navbar;
