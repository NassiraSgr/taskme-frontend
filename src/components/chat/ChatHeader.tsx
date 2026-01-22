import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";

const ChatHeader = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [taskName, setTaskName] = useState("Chargement...");
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  

  const fetchMessagesCount = async () => {
    if (!taskId) return;

    try {
      const res = await axios.get(`/chat/${taskId}`,{withCredentials:true});
      const res2 = await fetch(`http://localhost:3000/api/task/${taskId}`,{
        headers:{'Content-Type':'application/json'},
        credentials:'include'
      })
      const data = await res2.json()
      //console.log(data.data.nom);
      
      setTaskName(data.data.nom)
      if (res.data?.success) {
        setMessagesCount(res.data.messages?.length || 0);
       
      }
    } catch (err) {
      console.error("Erreur fetchMessagesCount:", err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchMessagesCount();
    setLoading(false);
  };

  useEffect(() => {
    if (!taskId) return;
    refreshData();

    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [taskId]);

  if (loading) return <div style={{ padding: 24, color: "#fff" }}>Chargement…</div>;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
      }}
    >
      {/* Titre + statut */}
      <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",marginBottom: 20,}}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            💬
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{taskName}</h2>        
          </div>
        </div>

      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {/* Messages */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: 16,
            borderRadius: 12,
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            💬 {messagesCount}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Messages</div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
