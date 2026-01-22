export interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role?: string;
    specialite?: string;
  };
  receiver?: {
    _id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
  task?: string;
  messageType: 'task' | 'direct' | 'group';
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}