import React, { useState } from 'react';
import axios from 'axios';
import ResultCard from './ResultCard';
import OptimizationTips from './OptimizationTips';

const carriers = ["Carrier A", "Carrier B", "Carrier C", "Carrier D"];
const times = ["Morning", "Afternoon", "Evening", "Night"];

function PredictionForm({ setRefreshTrigger }) {
  const [formData, setFormData] = useState({
    caller_id: '',
    receiver_id: '',
    duration: '',
    latency: '',
    carrier: 'Carrier A',
    time_of_day: 'Morning'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      // Predict cost
      const res = await axios.post('http://localhost:8000/predict_cost/', {
        ...formData,
        duration: parseFloat(formData.duration),
        latency: parseFloat(formData.latency)
      });

      setResult(res.data);

      // Fetch optimization suggestions
      const optimizationRes = await axios.post('http://localhost:8000/suggest-optimizations/', {
        ...formData,
      });

      if (optimizationRes.data && optimizationRes.data.optimizations) {
        setResult((prevState) => ({
          ...prevState,
          optimizations: optimizationRes.data.optimizations,
        }));
      }

      // Dispatch event for global refresh (other pages)
      window.dispatchEvent(new Event('predictionMade')); // Event for global refresh
      if (setRefreshTrigger) setRefreshTrigger((prev) => prev + 1); // Trigger refresh in other pages
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail?.error || err.message || "Prediction failed.");
    }
  };

  return (
    <div className="card shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Caller ID</label>
            <input
              type="text"
              className="form-control"
              name="caller_id"
              value={formData.caller_id}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div className="col">
            <label className="form-label">Receiver ID</label>
            <input
              type="text"
              className="form-control"
              name="receiver_id"
              value={formData.receiver_id}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Duration (seconds)</label>
            <input
              type="number"
              className="form-control"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="col">
            <label className="form-label">Latency (ms)</label>
            <input
              type="number"
              className="form-control"
              name="latency"
              value={formData.latency}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Carrier</label>
            <select
              className="form-select"
              name="carrier"
              value={formData.carrier}
              onChange={handleChange}
            >
              {carriers.map((carrier) => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <label className="form-label">Time of Day</label>
            <select
              className="form-select"
              name="time_of_day"
              value={formData.time_of_day}
              onChange={handleChange}
            >
              {times.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          🔮 Predict Cost
        </button>
      </form>

      {error && (
        <div className="alert alert-danger mt-3 text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <ResultCard cost={result.predicted_cost} />

          {/* Render optimization suggestions */}
          {result.optimizations && result.optimizations.length > 0 ? (
            <OptimizationTips optimizations={result.optimizations} />
          ) : (
            <div className="alert alert-info mt-4">No optimization suggestions available.</div>
          )}

          <div className="text-center text-muted mt-2">
            <small>Prediction Time: {result.timestamp}</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;


