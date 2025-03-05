import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DashboardHome = () => {
  const [totalEmployees, setTotalEmployees] = useState(10); // Static for now
  const [absentEmployees, setAbsentEmployees] = useState(2); // Static for now
  const [presentEmployees, setPresentEmployees] = useState(totalEmployees - absentEmployees);
  const [salary, setSalary] = useState(15000); // Static for now

  // To-Do Tasks (Temporary frontend)
  const [tasks, setTasks] = useState([
    { id: 1, task: "Finish Asset Logs", completed: false },
    { id: 2, task: "Build CAD Model of Brain", completed: false },
    { id: 3, task: "Integrate all codes of ITMS", completed: false },
    { id: 4, task: "Schedule team meeting", completed: false },
    { id: 5, task: "Prepare monthly report", completed: false },
  ]);

  // Handle checkbox change
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="container mt-4">
      {/* Employee Summary */}
      <div className="row">
        <div className="col-md-3">
          <div className="card p-3 text-center shadow">
            <h5>Total No. of Employees</h5>
            <h2>{totalEmployees}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow">
            <h5>No. of Absent Employees</h5>
            <h2>{absentEmployees}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow">
            <h5>No. of Present Employees</h5>
            <h2>{presentEmployees}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow">
            <h5>Salary</h5>
            <h2>₹{salary}</h2>
          </div>
        </div>
      </div>

      {/* To-Do Tasks and Calendar */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5>To-Do Tasks</h5>
            <ul className="list-group">
              {tasks.map((task) => (
                <li key={task.id} className="list-group-item d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className={task.completed ? "text-decoration-line-through" : ""}>
                    {task.task}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Calendar */}
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5>Calendar</h5>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
