import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    // ✅ Use environment variable (works locally & on Netlify)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log("🔍 Sending Request to:", `${backendUrl}/auth/teamleadlogin`);
            const response = await axios.post(`${backendUrl}/auth/teamleadlogin`, values);
    
            console.log("✅ Server Response:", response.data);
    
            if (response.data.loginStatus) {
                localStorage.setItem("teamLeadId", response.data.id);  // ✅ Store TeamLead ID
                navigate("/dashboard"); // ✅ Redirect to Dashboard
            } else {
                setError(response.data.Error);
            }
        } catch (err) {
            console.error("❌ API Call Error:", err);
            setError("Login failed. Please check your credentials.");
        }
    };    

    return (
        <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
            <div className='p-3 rounded w-25 border loginForm'>
                <div className='text-warning'>
                    {error && error}
                </div>
                <h2>SSEV SOFT SOLS</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email"><strong>Email:</strong></label>
                        <input
                            type="email"
                            name='email'
                            autoComplete='off'
                            placeholder='Enter Email'
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            className='form-control rounded-0'
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password"><strong>Password:</strong></label>
                        <input
                            type="password"
                            name='password'
                            placeholder='Enter Password'
                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                            className='form-control rounded-0'
                        />
                    </div>
                    <button className='btn btn-success w-100 rounded-0 mb-2'>Log in</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
