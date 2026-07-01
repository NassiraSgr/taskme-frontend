import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Message } from "../../types/Message";
import ChatBox from "../../components/chat/ChatBox";
import ChatInput from "../../components/chat/ChatInput";
import "./DirectChatPage.css";
import Loader from "../../components/Loader/Loader";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialite: string;
}

const DirectChatPage = ({user} :{user:string}) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Charger tous les utilisateurs disponibles
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('https://taskme-backend-wt4m.onrender.com/api/users',{
          headers:{'Content-Type':'application/json'},
          credentials:'include'
        }); 
        if(!res.ok) return 

        const data = await res.json()
        // console.log(data);
        
        setUsers(data.data);
      } catch (err) {
        console.error("Erreur chargement utilisateurs :", err);
      } finally {
        setLoadingUsers(false);
    }
    };
    loadUsers();
  }, []);

  // Charger messages si un utilisateur est sélectionné
  useEffect(() => {
    if (userId) {
      loadMessages(userId);
    } else {
      setMessages([]);
      setTargetUser(null);
    }
    
    
  }, [userId]);

  const loadMessages = async (targetUserId: string) => {
    setLoadingChat(true);
    try {
      setLoading(true);
      const res = await axios.get(`/chat/direct/${targetUserId}`);
      console.log(res)
      setMessages(res.data.messages);
      console.log('targetUser....',res.data);
      
      setTargetUser(res.data.targetUser || null);
    } catch (err) {
      console.error("Erreur chargement messages :", err);
      setTargetUser(null);
      setMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSelectUser = (user: User) => {
    navigate(`/chat/direct/${user._id}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!userId || !content.trim()) return;

    try {
      const res = await axios.post("/chat/direct", {
        receiverId: userId,
        content
      });

      setMessages([...messages, res.data.message]);

      // Si targetUser n'était pas encore défini, on le crée à partir des users
      if (!targetUser) {
        const user = users.find(u => u._id === userId);
        setTargetUser(user || null);
      }
    } catch (err) {
      console.error("Erreur envoi message :", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // Filtrer les utilisateurs pour la recherche
  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingUsers) {
    return <Loader />;
}

  return (
    <div className="direct-chat-container">
      {/* Sidebar */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>💬 Utilisateurs</h2>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="conversations-list">
          {filteredUsers.filter(u => u._id!==user).map(user => (
            <div
              key={user._id}
              className={`conversation-item ${userId === user._id ? 'active' : ''}`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="conversation-avatar">{user.firstName.charAt(0)}</div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-name">{user.firstName} {user.lastName}</span>
                  <span className="conversation-role">{user.role}</span>
                </div>
                <p className="conversation-preview">{user.specialite}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="chat-main-area">
       {loadingChat ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">
                Chargement de la conversation...
              </p>
            </div>
          </div>
        ) : targetUser ? (
          <>
            {/* Header du chat */}
            <div className="direct-chat-header">
              <div className="user-info">
                <div className="user-avatar">{targetUser.firstName.charAt(0)}</div>
                <div>
                  <h3>{targetUser.firstName} {targetUser.lastName}</h3>
                  <p className="user-details">{targetUser.role} • {targetUser.specialite}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages-container">
              <ChatBox 
                messages={messages}
                currentUserId={localStorage.getItem("userId") || ""}
              />
            </div>

            {/* Input */}
            <div className="chat-input-container">
              <ChatInput
                onSend={handleSendMessage}
                disabled={loading}
              />
            </div>
          </>
        ) : (
          <div className="select-conversation">
            <div className="select-icon">👈</div>
            <h3>Sélectionnez un utilisateur</h3>
            <p>Choisissez un utilisateur dans la liste pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChatPage;
