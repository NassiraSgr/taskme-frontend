import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import Login from './pages/UserModals/login';
import Register from './pages/UserModals/register';
import Home from './pages/home';
import CreateTask from './pages/TaskModals/createTask';
import Tasks from './pages/TaskModals/tasks';
import Task from './pages/TaskModals/Task';
import Dashboard from './pages/Dashboards/AdminDashbord';
import UsersManagement from './pages/UserModals/gestionUser';
import UserDashboard from './pages/Dashboards/userDashboard';
import HistoriqueDashboard from './pages/Dashboards/historique/HistoriqueDashboard';
import NotificationList from './pages/notificationList';
import { NotificationProvider } from './context/NotificationContext';
import EditTaskWindow from './pages/TaskModals/EditTaskWindow';
import TaskChatPage from './pages/ChatPages/TaskChatPage';
import DirectChatPage from './pages/ChatPages/DirectChatPage';
import { useTheme } from './context/ThemeContext';
import VehicleManagement from './pages/Vehcule/VehiculeMnagement';
import AffectationsTable from './pages/affectationModals/affectationTable';

function App() {
  const { theme } = useTheme();

  // state global utilisateur
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Vérifie session existante
  const fetchUser = async () => {
    try {
      const res = await fetch(
        'https://taskme-backend-wt4m.onrender.com/api/user',
        {
          credentials: 'include',
        },
      );
      if (!res.ok) throw new Error('Not authenticated');
      const content = await res.json();
      setUser(content.data._id);
      setRole(content.data.role);
      setName(content.data.firstName);
    } catch {
      setUser(null);
      setRole('');
      setName('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <NotificationProvider>
      <BrowserRouter>
        <div
          className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900'}`}
        >
          <Navbar
            name={name}
            setName={setName}
            role={role}
            setUser={setUser}
            setRole={setRole}
          />
          <main className="p-4">
            <Routes>
              <Route
                path="/login"
                element={
                  <Login
                    setUser={setUser}
                    setRole={setRole}
                    setName={setName}
                  />
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/addTask" element={<CreateTask />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route
                path="/tasks/:id"
                element={<Task userRole={role} userId={user} />}
              />
              <Route path="/" element={<Home user={user} />} />
              <Route path="/notifications" element={<NotificationList />} />
              <Route
                path="/userManagement"
                element={<UsersManagement userId={user} />}
              />
              <Route path="/edit-task/:id" element={<EditTaskWindow />} />
              <Route path="/tasks/:taskId/chat" element={<TaskChatPage />} />
              <Route path="/chat/task/:taskId" element={<TaskChatPage />} />
              <Route
                path="/chat/direct"
                element={<DirectChatPage user={user} />}
              />
              <Route
                path="/chat/direct/:userId"
                element={<DirectChatPage user={user} />}
              />
              <Route
                path="/vehiculeManagement"
                element={<VehicleManagement userRole={role} />}
              />
              {role === 'SUPER_ADMIN' || role === 'COORDINATEUR' ? (
                <Route
                  path="/dashboard"
                  element={<Dashboard user={user} userRole={role} />}
                />
              ) : (
                <Route
                  path="/dashboard"
                  element={<UserDashboard userId={user} />}
                />
              )}
              <Route
                path="/historique"
                element={<HistoriqueDashboard user={user} />}
              />
              <Route path="/affectations" element={<AffectationsTable />} />
            </Routes>
          </main>
          <hr />
          <Footer />
        </div>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
