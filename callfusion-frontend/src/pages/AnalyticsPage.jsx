import React from "react";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

const AnalyticsPage = ({ refreshTrigger }) => {
  return (
    <div className="container py-4">
      <AnalyticsDashboard refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default AnalyticsPage;
