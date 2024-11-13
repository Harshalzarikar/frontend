import axios from "axios";

const API_URL = "http://localhost:3000";
export const api = {
  getEvents: () => axios.get(`${API_URL}/events`),
  createEvent: (event) => axios.post(`${API_URL}/events`, event),
  updateEvent: (id, event) => axios.put(`${API_URL}/events/${id}`, event),
  deleteEvent: (id) => axios.delete(`${API_URL}/events/${id}`),
};
