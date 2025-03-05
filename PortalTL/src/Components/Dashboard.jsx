import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import Modal from "react-modal";

// Ensure modal works correctly
Modal.setAppElement("#root");

const Dashboard = () => {
  const [teamLead, setTeamLead] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userId = localStorage.getItem("teamLeadId");
  const navigate = useNavigate();

  // ✅ Fetch TeamLead Profile & Notifications
  useEffect(() => {
    if (!userId) {
      console.error("🚨 No User ID found in localStorage.");
      navigate("/teamleadlogin");
      return;
    }

    axios.get(`http://localhost:3002/employee/detail/${userId}`, { withCredentials: true })
      .then((response) => {
        if (response.data.Status) {
          setTeamLead(response.data.Result);
        }
      })
      .catch((err) => console.error("❌ Error fetching TeamLead data:", err));

    fetchNotifications();
  }, [userId, navigate]);

  // ✅ Fetch Notifications (Specific to this TeamLead using receiver_id)
  const fetchNotifications = () => {
    axios.get(`http://localhost:3002/auth/notifications/user/${userId}`)
      .then((response) => {
        if (response.data.Status) {
          setNotifications(response.data.Result);
        }
      })
      .catch((err) => console.error("❌ Error fetching notifications:", err));
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    axios.get("http://localhost:3002/employee/logout", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          localStorage.removeItem("teamLeadId");
          navigate("/teamleadlogin");
        } else {
          alert("Logout failed! Please try again.");
        }
      })
      .catch((err) => {
        console.error("❌ Logout Error:", err);
        alert("An error occurred during logout. Please try again.");
      });
  };

  // ✅ Navigate to Indent Form when notification clicked
  const handleNotificationClick = (notification) => {
    navigate(`/dashboard/review_indent/${notification.indent_id}`);
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* ✅ Sidebar */}
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark min-vh-100 position-fixed">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-3 text-white">
            {/* ✅ TeamLead Profile Section */}
            {teamLead ? (
              <div className="text-center mt-2">
                <img
                  src={teamLead.image ? `http://localhost:3000/images/${teamLead.image}` : "http://localhost:3000/images/default-profile.png"}
                  alt="TeamLead Profile"
                  className="rounded-circle"
                  style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px solid white" }}
                  onError={(e) => (e.target.src = "http://localhost:3000/images/default-profile.png")}
                />
                <h5 className="mt-2">{teamLead.name}</h5>
                <p className="text-white-50">{teamLead.email}</p>
                <span className="badge bg-primary">Team Leader</span>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}

            {/* ✅ Sidebar Navigation Links */}
            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start mt-4">
              <li className="w-100">
                <Link to="/dashboard" className="nav-link text-white px-3 d-flex align-items-center">
                  <i className="fs-4 bi-speedometer2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link to="/dashboard/employees" className="nav-link text-white px-3 d-flex align-items-center">
                  <i className="fs-4 bi-people"></i>
                  <span className="ms-2 d-none d-sm-inline">Employees</span>
                </Link>
              </li>
              <li className="w-100">
                <Link to="/dashboard/assets" className="nav-link text-white px-3 d-flex align-items-center">
                  <i className="fs-4 bi-box"></i>
                  <span className="ms-2 d-none d-sm-inline">Assets</span>
                </Link>
              </li>
              <li className="w-100">
                <Link to="/dashboard/assetlogs" className="nav-link text-white px-3 d-flex align-items-center">
                  <i className="fs-4 bi-clipboard-check"></i>
                  <span className="ms-2 d-none d-sm-inline">Asset Logs</span>
                </Link>
              </li>
              <li className="w-100">
                <span className="nav-link text-white px-3 d-flex align-items-center" onClick={handleLogout} style={{ cursor: "pointer" }}>
                  <i className="fs-4 bi-power"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ✅ Main Content Area */}
        <div className="col offset-md-3">
          <div className="p-3 d-flex justify-content-between align-items-center shadow">
            <h4>TeamLead Dashboard</h4>

            {/* ✅ Notification Bell */}
            <div className="position-relative">
              <span className="fs-3 bi-bell text-dark" style={{ cursor: "pointer" }} onClick={() => setShowNotifications(!showNotifications)}></span>
              {notifications.length > 0 && (
                <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                  {notifications.length}
                </span>
              )}
              {showNotifications && (
                <div className="position-absolute bg-white shadow rounded p-3 mt-2" style={{ right: "10px", minWidth: "300px", zIndex: 100 }}>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowNotifications(false)}>Close</button>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2 border-bottom"
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: "pointer" }}
                      >
                        <p className="mb-1">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center">No new notifications</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Render Nested Routes */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
