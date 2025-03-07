import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ViewAssetRequest = () => {
  const { id } = useParams();  // Get request ID from URL
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("Pending");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios.get(`${backendUrl}/auth/asset_requests/${id}`)
      .then(response => {
        if (response.data.Status) {
          setRequest(response.data.Result);
          setStatus(response.data.Result.status);
        }
      })
      .catch(err => console.error("❌ Error fetching request details:", err));
  }, [id]);

  const handleUpdateStatus = (newStatus) => {
    axios.post(`${backendUrl}/auth/update_request/${id}`, { status: newStatus })
      .then(response => {
        if (response.data.Status) {
          alert("Request updated successfully!");
          navigate("/dashboard");  // Redirect to dashboard after update
        }
      })
      .catch(err => console.error("❌ Error updating request:", err));
  };

  if (!request) return <p>Loading request details...</p>;

  return (
    <div className="container">
      <h3>Asset Request Details</h3>
      <p><strong>Asset Name:</strong> {request.asset_name}</p>
      <p><strong>Requested By:</strong> {request.requested_by}</p>
      <p><strong>Reason:</strong> {request.reason}</p>
      <p><strong>Specifications:</strong> {request.specifications}</p>
      <p><strong>Date of Requirement:</strong> {request.date_of_requirement}</p>
      <p><strong>Current Status:</strong> {status}</p>

      {/* Approve or Reject */}
      <button className="btn btn-success" onClick={() => handleUpdateStatus("Approved")}>Approve</button>
      <button className="btn btn-danger ms-3" onClick={() => handleUpdateStatus("Rejected")}>Reject</button>
    </div>
  );
};

export default ViewAssetRequest;
