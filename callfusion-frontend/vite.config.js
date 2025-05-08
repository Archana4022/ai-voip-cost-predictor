// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:8000', // Replace with your backend URL
    },
  },
};
