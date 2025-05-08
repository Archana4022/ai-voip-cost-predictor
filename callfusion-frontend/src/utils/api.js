// src/utils/api.js
import axios from "axios";

// Function to fetch the predicted cost from the backend API
export const fetchPrediction = async (predictionData) => {
  try {
    const response = await axios.post('http://localhost:8000/predict_cost/', predictionData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prediction:", error.response?.data || error.message);
    throw error;
  }
};

// Function to suggest optimizations for cheaper calls
export const fetchOptimizationSuggestions = async (callData) => {
  try {
    const response = await axios.post('http://localhost:8000/suggest-optimizations/', callData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching optimizations:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch call history from the backend API
export const fetchCallHistory = async (params) => {
  try {
    const { search, sort_by, order, limit, offset, start_date, end_date, format } = params;
    
    const query = new URLSearchParams({
      search,
      sort_by,
      order,
      limit,
      offset,
      start_date,
      end_date,
      format
    }).toString();

    const response = await axios.get(`http://localhost:8000/call-history?${query}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching call history:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch analytics data from the backend API
export const fetchAnalytics = async () => {
  try {
    const response = await axios.get('http://localhost:8000/analytics');
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};