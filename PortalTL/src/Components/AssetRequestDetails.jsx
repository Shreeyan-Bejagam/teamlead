import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AssetRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestDetails, setRequestDetails] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    axios.get(`${backendUrl}/auth/asset_requests/details/${id}`)
      .then((response) => {
        if (response.data.Status) {
          setRequestDetails(response.data.Result);
        }
      })
      .catch((err) => console.error("❌ Error fetching asset request details:", err));
  }, [id]);

  const handleDecision = (decision) => {
    axios.put(`${backendUrl}/auth/approve_reject_asset/${id}`, {
      status: decision,
      comment,
      requested_by: requestDetails.requested_by,
    })
      .then((response) => {
        if (response.data.Status) {
          alert(`Request ${decision} successfully!`);
          navigate("/dashboard/asset-requests"); // Redirect after decision
        }
      })
      .catch((err) => console.error(`❌ Error ${decision} request:`, err));
  };


  if (!requestDetails) return <p>Loading request details...</p>;

  return (
    <div className="container mt-4">
      <h3>Asset Request Details</h3>
      <div className="card p-3">
        <p><strong>Asset Name:</strong> {requestDetails.asset_name}</p>
        <p><strong>Requested By:</strong> {requestDetails.requested_by_name}</p>
        <p><strong>Liable Person:</strong> {requestDetails.liable_person}</p>
        <p><strong>Status:</strong> {requestDetails.status}</p>

        {/* 🔹 Comment Box */}
        <textarea
          className="form-control mt-2"
          placeholder="Add comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        {/* 🔹 Approve & Reject Buttons */}
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={() => handleDecision("Approved")}>
            Approve
          </button>
          <button className="btn btn-danger" onClick={() => handleDecision("Rejected")}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetRequestDetails;
