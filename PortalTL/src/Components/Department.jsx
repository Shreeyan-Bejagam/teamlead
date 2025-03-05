import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3002/departments", { withCredentials: true }) // ✅ Send credentials
      .then((res) => {
        if (res.data.Status) {
          setDepartments(res.data.Result);
        } else {
          console.warn("❌ Department Fetch Error:", res.data.Error);
        }
      })
      .catch((err) => console.error("❌ Error fetching departments:", err));

    axios.get("http://localhost:3002/teams", { withCredentials: true }) // ✅ Send credentials
      .then((res) => {
        if (res.data.Status) {
          setTeams(res.data.Result);
        } else {
          console.warn("❌ Team Fetch Error:", res.data.Error);
        }
      })
      .catch((err) => console.error("❌ Error fetching teams:", err));
  }, []); // ✅ Runs only once when the component mounts

  return (
    <div className="container mt-3">
      <h3 className="text-center">Department List</h3>
      
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>{dept.name}</td>
              <td>
                <button className="btn btn-info btn-sm" onClick={() => navigate(`/dashboard/view_department/${dept.id}`)}>
                  View More
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-center mt-5">Teams List</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Department;
