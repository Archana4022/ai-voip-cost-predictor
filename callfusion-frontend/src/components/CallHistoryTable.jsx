import React, { useEffect, useState } from "react";
import { Table, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { FaSortUp, FaSortDown, FaFileCsv } from "react-icons/fa";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const CallHistoryTable = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [highlightCount] = useState(3);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/call-history`, {
        params: {
          search,
          sort_by: sortBy,
          order,
          limit,
          offset,
        },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching call history:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, sortBy, order, offset, refreshTrigger]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE}/call-history`, {
        params: {
          format: "csv",
          search,
          sort_by: sortBy,
          order,
          limit: 1000,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "call_history.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  return (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Search by Caller ID or Carrier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md="auto">
          <Button variant="outline-success" onClick={exportCSV}>
            <FaFileCsv className="me-2" />
            Export CSV
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => toggleSort("timestamp")}>
                Timestamp {sortBy === "timestamp" && (order === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th>Caller</th>
              <th>Receiver</th>
              <th onClick={() => toggleSort("duration")}>
                Duration {sortBy === "duration" && (order === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th>Carrier</th>
              <th>Latency</th>
              <th>Time</th>
              <th onClick={() => toggleSort("predicted_cost")}>
                Cost {sortBy === "predicted_cost" && (order === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((call, idx) => (
              <tr key={idx} className={idx < highlightCount ? "table-success" : ""}>
                <td>{call.timestamp}</td>
                <td>{call.caller_id}</td>
                <td>{call.receiver_id}</td>
                <td>{call.duration}s</td>
                <td>{call.carrier}</td>
                <td>{call.latency}ms</td>
                <td>{call.time_of_day}</td>
                <td>₹{call.predicted_cost}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Row className="justify-content-between mt-3">
        <Col md="auto">
          <Button variant="secondary" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>
            ⬅ Prev
          </Button>
        </Col>
        <Col md="auto">
          <Button variant="secondary" onClick={() => setOffset(offset + limit)} disabled={data.length < limit}>
            Next ➡
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CallHistoryTable;
