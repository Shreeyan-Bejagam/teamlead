import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * ✅ Admin Login Route
 */
router.post("/adminlogin", (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ?";

    con.query(sql, [req.body.email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });

        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                if (err || !response) return res.json({ loginStatus: false, Error: "Wrong email or password" });

                const { id, email } = result[0];
                const token = jwt.sign({ role: "admin", email, id }, "jwt_secret_key", {
                    expiresIn: "1d",
                });

                res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });

                return res.json({ loginStatus: true });
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

/**
 * ✅ Fetch All Employees
 * TeamLead can only see employees.
 */
router.get("/employees", (req, res) => {
    const sql = "SELECT id, name, email, designation FROM employee";

    con.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Query Error:", err);
            return res.json({ Status: false, Error: "Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
});

/**notifications */
router.post("/submit_indent", (req, res) => {
    const {
        indent_no,
        name_and_designation_of_the_indenter,
        personal_file_no,
        office_project,
        project_no_and_title,
        budget_head,
        items_head,
        type_of_purchase,
        issue_gst_exemption_certificate,
        justification_of_procurement,
        item_details,
        requested_by,
    } = req.body;

    // 1️⃣ 🔥 Dynamically find the TeamLead
    const getTeamLeadQuery = `
        SELECT id FROM employee WHERE designation = 'Team Leader' LIMIT 1;
    `;

    con.query(getTeamLeadQuery, (err, teamLeadResult) => {
        if (err || teamLeadResult.length === 0) {
            console.error("❌ Error finding TeamLead:", err);
            return res.json({ Status: false, Error: "No TeamLead Found" });
        }

        const teamLeadId = teamLeadResult[0].id; // ✅ Fetch the correct TeamLead ID

        // 2️⃣ ✅ Insert the indent request
        const insertIndentSql = `
            INSERT INTO indent_requests (
                indent_no, name_and_designation_of_the_indenter, personal_file_no, office_project,
                project_no_and_title, budget_head, items_head, type_of_purchase,
                issue_gst_exemption_certificate, justification_of_procurement,
                item_details, current_stage, status, requested_by, teamlead_id
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        con.query(insertIndentSql, [
            indent_no, name_and_designation_of_the_indenter, personal_file_no, office_project,
            project_no_and_title, budget_head, items_head, type_of_purchase,
            issue_gst_exemption_certificate, justification_of_procurement,
            JSON.stringify(item_details), 'TeamLead', 'Pending', requested_by, teamLeadId
        ], (err, result) => {
            if (err) {
                console.error("❌ Error inserting indent:", err);
                return res.json({ Status: false, Error: "Database Insertion Error" });
            }

            const indent_id = result.insertId;

            // 3️⃣ ✅ Insert notification for the correct TeamLead
            const notificationSql = `
                INSERT INTO notifications (request_id, message, receiver_id, receiver_role, status)
                VALUES (?, ?, ?, 'teamlead', 'unread')
            `;
            const message = `New Indent Request Submitted by ${requested_by}`;

            con.query(notificationSql, [indent_id, message, teamLeadId], (notifErr) => {
                if (notifErr) {
                    console.error("❌ Error inserting teamlead notification:", notifErr);
                    return res.json({ Status: false, Error: "Notification Insertion Failed" });
                }

                return res.json({ Status: true, Message: "Indent Submitted & Notification Sent to TeamLead!" });
            });
        });
    });
});



router.get("/notifications/user/:teamlead_id", (req, res) => {
    const { teamlead_id } = req.params;

    const sql = `
        SELECT * 
        FROM notifications 
        WHERE recipient_role = 'TeamLead' 
        AND receiver_id = ?
        AND is_read = 0
        ORDER BY created_at DESC
    `;

    con.query(sql, [teamlead_id], (err, result) => {
        if (err) {
            console.error("Fetch Notifications Error:", err);
            return res.json({ Status: false, Error: "Database Error" });
        }

        return res.json({ Status: true, Result: result });
    });
});

router.get("/get_indent/:id", (req, res) => {
    const indentId = req.params.id;

    const sql = `
        SELECT * FROM indent_requests WHERE id = ? LIMIT 1;
    `;

    con.query(sql, [indentId], (err, result) => {
        if (err) {
            console.error("❌ Error fetching indent:", err);
            return res.json({ Status: false, Error: "Database Query Error" });
        }

        if (result.length === 0) {
            console.error("❌ No indent found with ID:", indentId);
            return res.status(404).json({ Status: false, Error: "Indent Not Found" });
        }

        return res.json({ Status: true, Indent: result[0] });
    });
});
/**
 * ✅ TeamLead Approval - Update Indent
 * NOTE: Removed `current_stage` and `status` columns
 */
router.post("/teamlead_update_indent", (req, res) => {
    const {
        indent_id,
        justification_of_procurement
    } = req.body;

    const updateIndentSql = `
        UPDATE indent_requests
        SET justification_of_procurement = ?
        WHERE id = ?
    `;

    con.query(updateIndentSql, [
        justification_of_procurement,
        indent_id
    ], (err) => {
        if (err) {
            console.error("❌ Error updating indent:", err);
            return res.json({ Status: false, Error: "Database Update Error" });
        }

        // ✅ Send Notifications to MD, Accounts TL, Finance TL, Procurement TL
        sendIndentNotifications(indent_id, res);
    });
});

/**
 * ✅ Send Notifications to MD, Accounts TL, Finance TL, Procurement TL
 */
function sendIndentNotifications(indent_id, res) {
    const fetchReceiversSql = `
        SELECT id, department_id 
        FROM employee 
        WHERE department_id IN (16, 32, 33, 34)
    `;

    con.query(fetchReceiversSql, (err, users) => {
        if (err) {
            console.error("❌ Error fetching MD & TLs:", err);
            return res.json({ Status: false, Error: "Failed to fetch MD & TLs for notifications" });
        }

        if (users.length === 0) {
            console.warn("⚠️ No MD or TLs found");
            return res.json({ Status: false, Error: "No MD or TLs found in the system" });
        }

        const roleMap = {
            16: 'MD',
            32: 'AccountsTL',
            33: 'FinanceTL',
            34: 'ProcurementTL'
        };

        const notifications = users.map(user => [
            indent_id,
            user.id,
            `New Indent requires your review.`,
            roleMap[user.department_id],
            0,  // is_read
            new Date()
        ]);

        const notificationInsertSql = `
            INSERT INTO notifications (indent_id, receiver_id, message, recipient_role, is_read, created_at)
            VALUES ?
        `;

        con.query(notificationInsertSql, [notifications], (notifErr) => {
            if (notifErr) {
                console.error("❌ Notification Insert Error:", notifErr);
                return res.json({ Status: false, Error: "Notification Insertion Failed" });
            }

            console.log("✅ Notifications sent to MD & TLs:", notifications);
            res.json({ Status: true, Message: "Indent submitted & notifications sent successfully!" });
        });
    });
}

/**
 * ✅ Admin Logout
 */
router.get("/logout", (req, res) => {
    console.log("Logout API Called!"); // Debugging log
    res.clearCookie("token");
    return res.json({ Status: true });
});


// ✅ Correct export
export { router as adminRouter };
