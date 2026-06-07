// src/services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socket = null;

export const socketService = {
  /**
   * Connect to the server. Call this right after login.
   * @param {string} token - The JWT token from login
   */
  connect: (token) => {
    if (socket) return; // already connected

    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  },

  /**
   * Disconnect from the server. Call on logout.
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Listen to a socket event.
   * @param {string}   event    - Event name
   * @param {Function} callback - Handler function
   */
  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  /**
   * Remove a specific listener.
   * @param {string}   event    - Event name
   * @param {Function} callback - The same handler passed to on()
   */
  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },

  getSocket: () => socket,
};