import axios from 'axios';

// base URL for the API
const BASE_URL = 'http://127.0.0.1:8000';

// axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
});



export const postSignUp = (data: FormData) => {
    return api.post('auth/register/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  


export const postLogin = (data: Record<string, any>) => {
    return api.post('auth/login/', data);
  };

  

// intercept and refresh expired tokens

// request interceptor to add the access token to the headers
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// // response interceptor to handle token refresh
// api.interceptors.response.use(
//   (response) => response,  // If response is successful, just return it
//   async (error) => {
//     if (error.response.status === 401) {
//       // The access token is expired
//       const refreshToken = getCookie('refresh_token');  // Function to get the refresh token from cookies

//       if (refreshToken) {
//         // Try to refresh the token
//         const response = await axios.post('auth/refresh-token/', {}, {
//           withCredentials: true,  // Ensure cookies are sent with the request
//         });

//         // If refresh is successful, store the new access token and retry the original request
//         localStorage.setItem('access_token', response.data.access);
//         error.config.headers['Authorization'] = `Bearer ${response.data.access}`;
//         return axios(error.config);
//       }
//     }
//     return Promise.reject(error);  // Reject other errors
//   }
// );

// // Utility function to get the cookie value (for use in the refresh token request)
// function getCookie(name: string) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(';').shift();
//   return null;
// }




// utiliy function to get conversation between users or start a new one
export const getConversationWithUser = async (userEmail) => {
  try {
    const response = await api.get(`conversations/with/${userEmail}/`);
    return response.data.id; // could be null if not found

    // const conversation = await api.get(`conversations/${response.data.id}/`);

    // console.log('gotten convo', conversation.data) 
    // return conversation.data


  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }

  
};









export default api;
