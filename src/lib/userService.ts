import api from "@/api"; 
import { User } from "@/types/chat";

const currentUserStr = localStorage.getItem("user");
const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
const currentUserId = currentUser?.id;

export const fetchUsers = async () => {
  const response = await api.get('/users/all/');
  return response.data.filter((user: User) => user.id !== currentUserId);;
};
