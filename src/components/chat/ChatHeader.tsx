import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";

const ChatHeader = () => {
  const { taskId } = useParams<{ taskId: string }>();

  const [taskName, setTaskName] = useState("");
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!taskId) return;

    try {
      const [messagesRes, taskRes] = await Promise.all([
        axios.get(`/chat/${taskId}`, {
          withCredentials: true,
        }),

        axios.get(`/task/${taskId}`, {
          withCredentials: true,
        }),
      ]);

      if (taskRes.data?.data) {
        setTaskName(taskRes.data.data.nom);
      }

      if (messagesRes.data?.success) {
        setMessagesCount(messagesRes.data.messages?.length || 0);
      }
    } catch (err) {
      console.error("Erreur ChatHeader :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [taskId]);

  if (loading) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 8px 30px rgba(0,0,0,.08)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <div
          style={{
            width: 220,
            height: 30,
            background: "#e5e7eb",
            borderRadius: 8,
            marginBottom: 18,
          }}
        />

        <div
          style={{
            width: 120,
            height: 18,
            background: "#e5e7eb",
            borderRadius: 6,
            marginBottom: 25,
          }}
        />

        <div
          style={{
            width: 140,
            height: 90,
            background: "#e5e7eb",
            borderRadius: 14,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(102,126,234,.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(255,255,255,.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 24,
            }}
          >
            💬
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {taskName}
            </h2>

            <span
              style={{
                opacity: 0.85,
                fontSize: 14,
              }}
            >
              Discussion de la tâche
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.12)",
            padding: 18,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            💬 {messagesCount}
          </div>

          <div
            style={{
              opacity: .9,
            }}
          >
            Messages
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;