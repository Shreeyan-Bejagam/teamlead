import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;  // ✅ Correctly get backend URL

    useEffect(() => {
        axios
            .get(`${backendUrl}/employee/`, { withCredentials: true })
            .then((result) => {
                console.log("✅ Employee Data Fetched:", result.data);
                if (result.data.Status) {
                    setEmployees(result.data.Result);
                } else {
                    alert(result.data.Error);
                }
            })
            .catch((err) => console.log("❌ Axios Error:", err));
    }, []);

    return (
        <div className="px-5 mt-3">
            <div className="d-flex justify-content-center">
                <h3>Employee List</h3>
            </div>

            <div className="mt-3">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Email</th>
                            <th>Designation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((e) => (
                            <tr key={e.id}>
                                <td>{e.name}</td>
                                <td>
                                    <img
                                        src={`${backendUrl}/Images/${e.image}`}
                                        className="employee_image"
                                        alt={e.name}
                                        style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                                    />

                                </td>
                                <td>{e.email}</td>
                                <td>{e.department_name ? e.department_name : "N/A"}</td>
                                <td>
                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => navigate(`/dashboard/employees/${e.id}`)} // ✅ Corrected path
                                    >
                                        View More
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

export default Employees;
