import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ FIXED: Import useNavigate

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [type, setType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    asset_name: "",
    asset_type: "",
    stock: 0,
    date_issued: "",
    liable_person: "",
    serial_number: "",
  });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const fetchAssets = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No token found in localStorage");
      return;
    }

    const endpoint = type === "All" ? "/auth/assets" : `/auth/assets?type=${type}`;

    axios
      .get(`${backendUrl}${endpoint}`, {  // 🔥 Uses VITE_BACKEND_URL dynamically
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.Status) {
          setAssets(response.data.Result);
        } else {
          alert("Failed to fetch assets");
        }
      })
      .catch((err) => console.error("❌ Error fetching assets:", err));
  };




  const handleAddAsset = () => {
    if (
      !newAsset.asset_name ||
      !newAsset.asset_type ||
      !newAsset.stock ||
      !newAsset.date_issued ||
      !newAsset.liable_person ||
      (newAsset.asset_type === "License" && !newAsset.serial_number)
    ) {
      alert("Please fill all required fields!");
      return;
    }

    axios
      .post(`${backendUrl}/auth/add_asset`, newAsset)
      .then((response) => {
        if (response.data.Status) {
          alert("Asset added successfully!");
          fetchAssets();
          setShowForm(false);
          setNewAsset({
            asset_name: "",
            asset_type: "",
            stock: 0,
            date_issued: "",
            liable_person: "",
            serial_number: "",
          });
        } else {
          alert(response.data.Error || "Error adding asset!");
        }
      })
      .catch((err) => {
        console.error("❌ Error adding asset:", err);
        alert("Error adding asset!");
      });
  };

  const handleDeleteAsset = (id) => {
    axios
      .delete(`${backendUrl}/auth/delete_asset/${id}`)
      .then((response) => {
        if (response.data.Status) {
          alert("Asset deleted successfully!");
          fetchAssets();
        } else {
          alert("Failed to delete asset");
        }
      })
      .catch((err) => console.error("Error deleting asset:", err));
};

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Assets</h3>
        {/* ✅ FIXED: Navigate to AddAsset page on button click */}
        <button className="btn btn-success" onClick={() => navigate("/dashboard/assets/add")}>
          Add Asset
        </button>
      </div>

      {/* ✅ Filter Buttons */}
      <div className="d-flex justify-content-center mb-3">
        {["All", "Software", "Hardware", "License", "Other"].map((assetType) => (
          <button
            key={assetType}
            className={`btn me-2 ${type === assetType ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setType(assetType)}
          >
            {assetType}
          </button>
        ))}
      </div>

      {/* ✅ Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Liable Person, Status, or Current Holder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Assets Table */}
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Stock</th>
            <th>Date Issued</th>
            <th>Liable Person</th>
            <th>Serial Number</th>
            <th>Status</th>
            <th>Current Holder</th>
            <th>Previous Holder</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets
            .filter(asset =>
              asset.liable_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asset.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asset.current_holder?.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure current_holder exists
            )
            .map((asset, index) => (
              <tr key={asset.id}>
                <td>{index + 1}</td>
                <td>{asset.asset_name}</td>
                <td>{asset.asset_type}</td>
                <td>{asset.stock}</td>
                <td>{asset.date_issued}</td>
                <td>{asset.liable_person}</td>
                <td>{asset.serial_number || "N/A"}</td>
                <td>{asset.status}</td>
                <td>{asset.current_holder || "N/A"}</td>
                <td>{asset.previous_holder || "N/A"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAsset(asset.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Assets;