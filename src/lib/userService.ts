import api from "@/api"; 

export const fetchUsers = async () => {
  const response = await api.get('/users/all/');
  return response.data;
};
