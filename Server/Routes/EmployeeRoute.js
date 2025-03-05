import express from "express";
import path from "path";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * ✅ TeamLead Login Route (POST)
 */
router.post("/teamleadlogin", (req, res) => {
    console.log("🚀 Login Request Received:", req.body);

    // ✅ Fetch TeamLead details from the database
    const sql = `
      SELECT e.*, d.name AS designation 
      FROM employee e
      JOIN departments d ON e.department_id = d.id 
      WHERE e.email = ? AND d.name = 'Team Leader'
    `;

    con.query(sql, [req.body.email], (err, result) => {
        if (err) {
            console.error("❌ SQL Query Error:", err);
            return res.status(500).json({ loginStatus: false, Error: "Database query error", Details: err.sqlMessage });
        }

        if (result.length > 0) {
            console.log("✅ Team Lead Found:", result[0]);

            bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                if (err) {
                    console.error("❌ Password Hashing Error:", err);
                    return res.status(500).json({ loginStatus: false, Error: "Password hashing error" });
                }

                if (!response) {
                    return res.json({ loginStatus: false, Error: "Wrong email or password" });
                }

                const { id, email, name, image, designation } = result[0];

                if (designation !== "Team Leader") {
                    return res.json({ loginStatus: false, Error: "Access Denied: Only Team Leads can log in." });
                }

                // ✅ Secure Cookie Setup (Allows TeamLead Authentication)
                const token = jwt.sign({ role: "teamlead", email, id }, "jwt_secret_key", { expiresIn: "1d" });

                res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "lax" });

                return res.json({ 
                    loginStatus: true, 
                    id, 
                    name, 
                    email, 
                    image, 
                    designation
                });
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

/**
 * ✅ Middleware: Verify TeamLead Authentication
 */
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log("❌ No Token Found - Unauthorized Access");
        return res.status(401).json({ Status: false, Error: "Not authenticated" });
    }

    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) {
            console.error("❌ Token Verification Failed:", err);
            return res.status(403).json({ Status: false, Error: "Invalid Token" });
        }
        req.id = decoded.id;
        req.role = decoded.role;
        next();
    });
};

/**
 * ✅ Fetch Employee Details (Protected Route)
 */
router.get('/detail/:id', verifyUser, (req, res) => {
    const id = req.params.id;
    const sql = `
      SELECT employee.*, departments.name AS department_name
      FROM employee
      LEFT JOIN departments ON employee.department_id = departments.id
      WHERE employee.id = ?`;
  
    con.query(sql, [id], (err, result) => {
      if (err) {
          console.error("❌ Database Query Error:", err);
          return res.status(500).json({ Status: false, Error: "Database error" });
      }
      if (result.length === 0) {
          return res.status(404).json({ Status: false, Error: "Employee not found" });
      }
      return res.json({ Status: true, Result: result[0] }); // ✅ Fixed Response Structure
    });
});

/**
 * ✅ Fetch All Employees (For TeamLead)
 */
router.get("/", verifyUser, (req, res) => {
    const sql = `
      SELECT employee.*, departments.name AS department_name 
      FROM employee 
      LEFT JOIN departments ON employee.department_id = departments.id
    `;

    con.query(sql, (err, result) => {
      if (err) {
        console.error("❌ Query Error:", err);
        return res.json({ Status: false, Error: "Query Error" });
      }
  
      return res.json({ Status: true, Result: result });
    });
});

/**
 * ✅ Verify Route is Working (GET)
 */
router.get("/test", (req, res) => {
    return res.json({ status: "EmployeeRouter is working!" });
});

export { router as EmployeeRouter };
