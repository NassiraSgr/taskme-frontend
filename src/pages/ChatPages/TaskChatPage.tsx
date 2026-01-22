import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMessages, sendMessage } from "../../api/chatService";
import { Message } from "../../types/Message";
import ChatBox from "../../components/chat/ChatBox";
import ChatInput from "../../components/chat/ChatInput";
import ChatHeader from "../../components/chat/ChatHeader";

const TaskChatPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = localStorage.getItem("userId") || "";

  // charger les messages 
  useEffect(() => {
    if (!taskId) return;

    const loadMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMessages(taskId);
        setMessages(data || []); 
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Connectez-vous pour accéder au chat");
        } else if (err.response?.status === 403) {
          setError("Vous n'avez pas accès à ce chat");
        } else {
          setError("Erreur de chargement du chat");
        }
        setMessages([]); 
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [taskId]);

  // envoyer un message 
  const handleSend = async (content: string) => {
    if (!taskId || !content.trim()) return;

    try {
      const newMessage = await sendMessage(taskId, content);
      setMessages(prev => [...(prev || []), newMessage]); 
    } catch {
      alert("Erreur lors de l'envoi du message");
    }
  };

  if (loading)
    return <div style={{ padding: 50 }}>Chargement...</div>;

  if (error)
    return (
      <div style={{
        maxWidth: 500,
        margin: "100px auto",
        padding: 40,
        textAlign: 'center',
        border: '1px solid #fecaca',
        borderRadius: 12
      }}>
        <div style={{ fontSize: '3em', marginBottom: 20 }}>🔒</div>
        <h3 style={{ color: '#dc2626', marginBottom: 10 }}>Accès refusé</h3>
        <p style={{ color: '#7f1d1d', marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Retour
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <ChatHeader />
      <ChatBox messages={messages || []} currentUserId={currentUserId} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default TaskChatPage;
