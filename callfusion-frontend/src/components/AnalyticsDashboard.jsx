import React, { useEffect, useState } from "react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter,
  BarChart, Bar
} from "recharts";
import { Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const AnalyticsDashboard = ({ refreshTrigger }) => {
  const [costTrend, setCostTrend] = useState([]);
  const [latencyHeatmap, setLatencyHeatmap] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/analytics`);
      setCostTrend(response.data.cost_trend || []);
      setLatencyHeatmap(response.data.latency_heatmap || []);
      setScatterData(response.data.scatter_data || []);

    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">📈 Analytics Dashboard</h2>

      <Row className="mb-5">
        <Col md={12}>
          <h5 className="text-center">📊 Cost Trend Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_cost" stroke="#007bff" />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={12}>
          <h5 className="text-center">🔥 Latency Heatmap by Carrier</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={latencyHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_latency" fill="#dc3545" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h5 className="text-center">💵 Cost vs Duration Scatter Plot</h5>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="duration" name="Duration" unit="s" />
              <YAxis type="number" dataKey="cost" name="Cost" unit="₹" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#28a745" />
            </ScatterChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
