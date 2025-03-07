import React, { useEffect, useState } from "react";
import axios from "axios";

const AssetRequests = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    fetchUserData();
    fetchAssets();
  }, []);

  const fetchUserData = () => {
    const teamLeadId = localStorage.getItem("teamLeadId");

    axios
      .get(`${backendUrl}/employee/detail/${teamLeadId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => console.error("❌ Error fetching user data:", err));
  };


  const fetchAssets = () => {
    const token = localStorage.getItem("token"); // 🔹 Fetch stored token

    if (!token) {
      console.error("❌ No token found! Redirecting to login...");
      return;
    }

    axios.get(`${backendUrl}/auth/assets`, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ Attach Token
    })
      .then((response) => {
        if (response.data.Status) {
          console.log("✅ Assets Fetched:", response.data.Result); // Debugging
          setAssets(response.data.Result);
          setFilteredAssets(response.data.Result); // ✅ Ensure filteredAssets is updated
        } else {
          console.error("❌ Failed to fetch assets");
        }
      })
      .catch((err) => console.error("❌ Error fetching assets:", err));
  };




  // Filter "My Assets" based on logged-in user's email
  useEffect(() => {
    if (user && assets.length > 0) {
      const assignedAssets = assets.filter(
        (asset) => asset.liable_person.toLowerCase() === user.email.toLowerCase()
      );
      setMyAssets(assignedAssets);
    }
  }, [user, assets]);

  // Search assets
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue === "") {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(
        assets.filter((asset) =>
          asset.asset_name.toLowerCase().includes(searchValue)
        )
      );
    }
  };

  const handleRequest = (asset) => {
    if (!user) {
      alert("User not found! Please log in again.");
      return;
    }

    const requestData = {
      asset_name: asset.asset_name,
      liable_person: asset.liable_person,
    };

    const token = localStorage.getItem("token"); // ✅ Fetch stored token

    axios
      .post(`${backendUrl}/auth/request_asset`, requestData, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Attach Token
      })
      .then((response) => {
        if (response.data.Status) {
          alert("Asset request sent successfully!");
        } else {
          alert("Failed to send asset request.");
        }
      })
      .catch((err) => console.error("❌ Error sending asset request:", err));
  };


  return (
    <div className="container mt-4">
      <h3>Asset Requests</h3>

      {/* Section 1: My Assets */}
      <div className="card p-3 mb-4">
        <h5>My Assets</h5>
        {myAssets.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Current Holder</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.asset_name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-danger">No assets assigned</p>
        )}
      </div>

      {/* Section 2: All Assets */}
      <div className="card p-3">
        <h5>All Assets</h5>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search Assets..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Liable Person</th>
              <th>Request</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.asset_name}</td>
                <td>{asset.liable_person}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRequest(asset)}
                  >
                    Request
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetRequests;
