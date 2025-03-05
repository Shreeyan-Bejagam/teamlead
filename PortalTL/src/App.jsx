import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import TeamLeadLogin from './Components/Login';
import Dashboard from './Components/Dashboard';
import DashboardHome from './Components/DashboardHome';
import Employees from './Components/Employees';
import ViewEmployees from './Components/ViewEmployees'; 

import Department from './Components/Department';
import ViewDepartmentEmployees from './Components/ViewDepartmentEmployees';
import ViewEmployeeDetails from './Components/ViewEmployeeDetails'; 

import Assets from './Components/Assets';
import AddAsset from './Components/AddAsset'; 
import Assetlog from './Components/Assetlog';
import Attendance from './Components/Attendance';

import AssetRequests from './Components/AssetRequests'; 
import ViewAssetRequest from "./Components/ViewAssetRequest"; 

// ✅ Import IndentForm (TeamLead will review this when clicking notifications)
import IndentForm from './Components/IndentForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ TeamLead Login Route */}
        <Route path="/" element={<TeamLeadLogin />} />
        <Route path="/teamleadlogin" element={<TeamLeadLogin />} />
        
        {/* ✅ TeamLead Dashboard with Nested Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />  {/* Default Page */}
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<ViewEmployees />} /> 

          {/* ✅ Department View */}
          <Route path="departments" element={<Department />} />
          <Route path="departments/:id" element={<ViewDepartmentEmployees />} /> 
          <Route path="employee/:id" element={<ViewEmployeeDetails />} /> 

          {/* ✅ Assets Section */}
          <Route path="assets" element={<Assets />} />
          <Route path="assets/add" element={<AddAsset />} /> 
          
          {/* ✅ Asset Requests Route */}
          <Route path="asset-requests" element={<AssetRequests />} />  
          <Route path="asset-requests/:id" element={<ViewAssetRequest />} />

          {/* ✅ NEW: Route for TeamLead to review Indent Form after clicking notification */}
          <Route path="review_indent/:indentId" element={<IndentForm mode="teamlead" />} />
          
          {/* ✅ Other Sections */}
          <Route path="assetlogs" element={<Assetlog />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

        {/* ✅ Redirect to Dashboard after login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
