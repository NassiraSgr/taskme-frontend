import { Message } from "../../types/Message";
import MessageItem from "./MessageItem";
import { useRef, useEffect, useState } from "react";

interface Props {
  messages: Message[];
  currentUserId?: string;
}

const ChatBox = ({ messages, currentUserId = "" }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [today] = useState(new Date().toDateString());


  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (date.toDateString() === today) {
      return "Aujourd'hui";
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = groupMessagesByDate();

  return (
    <div style={{
      height: 500,
      overflowY: "auto",
      padding: 20,
      borderRadius: 12,
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
      {Object.keys(groupedMessages).length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#999',
          padding: 40,
          fontStyle: 'italic'
        }}>
          <div style={{ fontSize: '3em', marginBottom: 10 }}>💬</div>
          <p>Soyez le premier à envoyer un message !</p>
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Séparateur de date */}
            <div>
              <div
               />
              <span >
                {formatDate(date)}
              </span>
            </div>

            {/* Messages de cette date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dateMessages.map(msg => (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;