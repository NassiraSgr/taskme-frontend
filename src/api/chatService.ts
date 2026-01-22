import axios from "./axios";

export const getMessages = async (taskId: string) => {
  const res = await axios.get(`/chat/${taskId}`,{withCredentials:true});
  console.log('messageeee',res.data);
  
  return res.data.messages;
};

export const sendMessage = async (taskId: string, content: string) => {
  const res = await axios.post(`/chat/send/${taskId}`, { content } , {withCredentials:true});
  return res.data.message;
};