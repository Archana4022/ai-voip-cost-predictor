import React from 'react';

const OptimizationTips = ({ optimizations }) => {
  return (
    <div className="alert alert-info mt-4">
      <h5>💡 Optimization Suggestions</h5>
      {Array.isArray(optimizations) && optimizations.length > 0 ? (
        <ul className="mb-0">
          {optimizations.map((opt, index) =>
            typeof opt === 'object' && opt.suggestion ? (
              <li key={index}>
                {opt.suggestion} — <strong>₹{opt.estimated_cost?.toFixed(2) ?? 'N/A'}</strong>
              </li>
            ) : (
              <li key={index} className="text-muted">{opt}</li> // For string messages like "No better alternatives..."
            )
          )}
        </ul>
      ) : (
        <p>No optimization suggestions available.</p>
      )}
    </div>
  );
};

export default OptimizationTips;
