import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddAsset = () => {
  const [newAsset, setNewAsset] = useState({
    asset_name: "",
    asset_type: "",
    stock: 0,
    date_issued: "",
    liable_person: "",
    serial_number: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation for required fields
    if (
      !newAsset.asset_name ||
      !newAsset.asset_type ||
      !newAsset.stock ||
      !newAsset.date_issued ||
      !newAsset.liable_person ||
      (newAsset.asset_type === "License" && !newAsset.serial_number)
    ) {
      alert("⚠️ Please fill all required fields!");
      return;
    }

    axios
      .post(`${backendUrl}/auth/add_asset`, newAsset)  // ✅ Use dynamic URL
      .then((response) => {
        if (response.data.Status) {
          alert("✅ Asset added successfully!");
          navigate("/dashboard/assets");  // Redirect back to Assets page
        } else {
          alert("❌ Error adding asset!");
        }
      })
      .catch((err) => {
        console.error("Error adding asset:", err);
        alert("❌ An unexpected error occurred.");
      });
  };


  return (
    <div className="container mt-4">
      <h3 className="mb-3">Add New Asset</h3>

      <form onSubmit={handleSubmit}>
        {/* Asset Name */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Asset Name"
            name="asset_name"
            value={newAsset.asset_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Asset Type Dropdown */}
        <div className="mb-3">
          <select
            className="form-select"
            name="asset_type"
            value={newAsset.asset_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="License">License</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Stock Count */}
        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Stock"
            name="stock"
            value={newAsset.stock}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date Issued */}
        <div className="mb-3">
          <input
            type="date"
            className="form-control"
            name="date_issued"
            value={newAsset.date_issued}
            onChange={handleChange}
            required
          />
        </div>

        {/* Liable Person */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Liable Person"
            name="liable_person"
            value={newAsset.liable_person}
            onChange={handleChange}
            required
          />
        </div>

        {/* Serial Number (Only for License Type) */}
        {newAsset.asset_type === "License" && (
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Serial Number"
              name="serial_number"
              value={newAsset.serial_number}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Submit & Cancel Buttons */}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            Add Asset
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard/assets")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;
