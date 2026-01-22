import { useState } from "react";

interface Props {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: Props) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;
    
    try {
      setSending(true);
      await onSend(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: "flex", 
      gap: "10px",
      padding: "16px",
      borderRadius: "12px",
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Chat désactivé..." : "Écrivez votre message..."}
        style={{ 
          flex: 1, 
          padding: "12px 16px", 
          fontSize: "14px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
        disabled={disabled || sending}
      />
      <button 
        type="submit" 
        disabled={!message.trim() || sending || disabled}
        style={{ 
          padding: "12px 24px",
          backgroundColor: (!message.trim() || disabled) ? "#9ca3af" : "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: (!message.trim() || disabled) ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: '600',
          transition: 'background-color 0.2s',
          minWidth: "80px"
        }}
        onMouseEnter={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.backgroundColor = "#4338ca";
          }
        }}
        onMouseLeave={(e) => {
          if (message.trim() && !disabled) {
            e.currentTarget.style.backgroundColor = "#4f46e5";
          }
        }}
      >
        {sending ? "..." : "Envoyer"}
      </button>
    </form>
  );
};

export default ChatInput;