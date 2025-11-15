// Axios instance for API calls
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Ensure this matches your backend server
  withCredentials: false,
});

export default api;
