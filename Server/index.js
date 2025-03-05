import express from "express";
import cors from "cors";
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";  
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Fix CORS Settings (Enable Cookies)
app.use(cors({
    origin: "http://localhost:5175",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(cookieParser());

// ✅ Use Employee Routes
app.use("/employee", EmployeeRouter);  

// ✅ Use Admin Routes
app.use("/auth", adminRouter);

// ✅ Authentication Middleware
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Status: false, Error: "Not authenticated" });
    }

    Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) {
            console.error("❌ Token Verification Failed:", err);
            return res.status(403).json({ Status: false, Error: "Invalid Token" });
        }
        req.id = decoded.id;
        req.role = decoded.role;
        next();
    });
};

// ✅ Verify Authentication Route
app.get("/verify", verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id });
});

// ✅ Start the Server
app.listen(3002, () => {
    console.log("✅ TeamLead Server is running on port 3002");
});
