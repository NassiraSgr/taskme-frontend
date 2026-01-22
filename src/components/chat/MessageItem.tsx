import { Message } from "../../types/Message";

interface Props {
  message: Message;
  currentUserId?: string;
}

const MessageItem = ({ message, currentUserId }: Props) => {
  const isOwnMessage = currentUserId === message.sender?._id;
  
  // Déterminer la couleur en fonction du rôle
  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return { bg: '#d32f2f', text: '#fff', badge: '#b71c1c' };
      case 'admin':
        return { bg: '#1976d2', text: '#fff', badge: '#0d47a1' };
      case 'user':
        return { bg: '#388e3c', text: '#fff', badge: '#1b5e20' };
      default:
        return { bg: '#757575', text: '#fff', badge: '#424242' };
    }
  };
  
  const getSenderName = () => {
    if (!message.sender) return "Utilisateur";
    
    const { firstName, lastName, role } = message.sender;
    let name = "Utilisateur";
    
    if (firstName && lastName) {
      name = `${firstName} ${lastName}`;
    } else if (firstName) {
      name = firstName;
    }
    
    if (role?.toLowerCase() === 'superadmin') {
      name = ` ${name}`;
    } else if (role?.toLowerCase() === 'admin') {
      name = ` ${name}`;
    }
    
    return name;
  };
  
  const roleColors = getRoleColor(message.sender?.role);
  const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
      marginBottom: 12
    }}>
      {/* En-tête du message */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
        marginLeft: isOwnMessage ? 0 : 8,
        marginRight: isOwnMessage ? 8 : 0
      }}>
        {!isOwnMessage && (
          <>
            {/* Avatar avec couleur de rôle */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: roleColors.bg,
              color: roleColors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {message.sender?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            
            {/* Nom et rôle */}
            <div>
              <strong style={{ 
                color: '#333',
                fontSize: '14px'
              }}>
                {getSenderName()}
              </strong>
              {message.sender?.role && (
                <span style={{
                  marginLeft: 6,
                  fontSize: '0.7em',
                  color: roleColors.badge,
                  fontWeight: 'bold',
                  padding: '1px 6px',
                  borderRadius: 10,
                  backgroundColor: `${roleColors.bg}15`
                }}>
                  {message.sender.role}
                </span>
              )}
            </div>
          </>
        )}
        
        {/* Heure */}
        <span style={{
          fontSize: '0.75em',
          color: '#666',
          marginLeft: 'auto'
        }}>
          {messageTime}
        </span>
      </div>
      
      {/* Bulle de message */}
      <div style={{
        backgroundColor: isOwnMessage ? '#e3f2fd' : '#fff',
        border: `1px solid ${isOwnMessage ? '#bbdefb' : '#e0e0e0'}`,
        borderRadius: 16,
        padding: '10px 14px',
        maxWidth: '70%',
        position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        borderLeft: isOwnMessage ? 'none' : `3px solid ${roleColors.bg}`,
        borderRight: isOwnMessage ? `3px solid ${roleColors.bg}` : 'none'
      }}>
        <div style={{ 
          color: '#333', 
          lineHeight: 1.4,
          fontSize: '14px',
          wordBreak: 'break-word'
        }}>
          {message.content}
        </div>
        
        {/* Indicateur de message lu/envoyé */}
        {isOwnMessage && (
          <div style={{
            fontSize: '0.65em',
            color: '#666',
            textAlign: 'right',
            marginTop: 2
          }}>
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;