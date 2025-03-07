import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Notifications = ({ teamLeadEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!teamLeadEmail) return; // Stop if no email

    axios
      .get(`${backendUrl}/auth/notifications/${teamLeadEmail}`)
      .then((response) => {
        if (response.data.Status) {
          setNotifications(response.data.Result);
        }
      })
      .catch((err) => console.error("❌ Error fetching notifications:", err));
  }, [teamLeadEmail]);

  // 🔹 Handle Notification Click
  const handleNotificationClick = (notificationId, requestId) => {
    // Step 1: Mark notification as read
    axios.put(`${backendUrl}/auth/notifications/mark-read/${notificationId}`)
      .then((response) => {
        if (response.data.Status) {
          // Step 2: Redirect to Asset Request Details Page
          navigate(`/dashboard/asset-requests/${requestId}`);
        }
      })
      .catch((err) => console.error("❌ Error marking notification as read:", err));
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-warning dropdown-toggle"
        type="button"
        id="notificationDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Notifications ({notifications.length})
      </button>
      <ul className="dropdown-menu" aria-labelledby="notificationDropdown">
        {notifications.length === 0 ? (
          <li className="dropdown-item">No new notifications</li>
        ) : (
          notifications.map((notification) => (
            <li key={notification.id} className="dropdown-item d-flex justify-content-between">
              {notification.message}
              <button
                className="btn btn-sm btn-primary ms-2"
                onClick={() => handleNotificationClick(notification.id, notification.request_id)}
              >
                View
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Notifications;
