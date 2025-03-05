import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ssev@1234",
    database: "employeems",
    port: 3308 // Ensure this matches XAMPP's MySQL port
});

// Attempt to connect
con.connect(function (err) {
    if (err) {
        console.error("Database Connection Error: ", err.message);
    } else {
        console.log("Database Connected Successfully ✅");
    }
});

export default con;
