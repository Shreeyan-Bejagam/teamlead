import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const TeamLeadIndentForm = () => {
    const { indentId } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [step, setStep] = useState(1);  // Page 1 or Page 2
    const [formData, setFormData] = useState({
        name_and_designation_of_the_indenter: "",
        personal_file_no: "",
        office_project: "",
        project_no_and_title: "",
        budget_head: "",
        items_head: "",
        type_of_purchase: "",
        issue_gst_exemption_certificate: "",
        item_details: [],
        justification_of_procurement: "",  // TeamLead's mandatory field
        
    });

    useEffect(() => {
        axios.get(`${backendUrl}/auth/get_indent/${indentId}`)
            .then(response => {
                if (response.data.Status) {
                    const indent = response.data.Indent;
                    setFormData({
                        ...indent,
                        item_details: JSON.parse(indent.item_details || "[]")
                    });
                } else {
                    alert("Failed to fetch indent data");
                    navigate("/dashboard");
                }
            })
            .catch(err => {
                console.error("Error fetching indent:", err);
                alert("Error loading indent");
            });
    }, [indentId, navigate]);
    
    const handleSubmit = () => {
        if (!formData.justification_of_procurement.trim()) {
            alert("Justification of Procurement is mandatory.");
            return;
        }
    
        axios.post(`${backendUrl}/auth/teamlead_update_indent`, {
            ...formData,
            indent_id: indentId
        }).then(() => {
            alert("Indent submitted successfully!");
            navigate("/dashboard");
        }).catch(err => {
            console.error("Submit Error:", err);
            alert("Failed to submit indent.");
        });
    };    

    return (
        <div className="container mt-4">
            <h2>Purchase Indent Form</h2>

            {step === 1 && (
                <>
                    <h3>Page 1: Employee Details & Items (Read Only)</h3>
                    <table className="table table-bordered">
                        <tbody>
                            {[
                                { label: "Name & Designation", value: formData.name_and_designation_of_the_indenter },
                                { label: "Personal File No", value: formData.personal_file_no },
                                { label: "Office/Project", value: formData.office_project },
                                { label: "Project No. & Title", value: formData.project_no_and_title },
                                { label: "Budget Head", value: formData.budget_head },
                                { label: "Items Head", value: formData.items_head },
                                { label: "Type of Purchase", value: formData.type_of_purchase },
                                { label: "Issue GST Exemption Certificate", value: formData.issue_gst_exemption_certificate }
                            ].map((row, idx) => (
                                <tr key={idx}><td>{row.label}</td><td><input type="text" value={row.value} readOnly className="form-control" /></td></tr>
                            ))}
                        </tbody>
                    </table>

                    <h4>Details of Items Being Demanded</h4>
                    <ul>
                        {formData.item_details.map((item, index) => (
                            <li key={index}>{item.name} - Cost: {item.cost}, Qty: {item.qty}, Required By: {item.required_by} weeks</li>
                        ))}
                    </ul>

                    <div className="mt-4">
                        <button className="btn btn-primary" onClick={() => setStep(2)}>Next (Approval & Review)</button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <h3>Page 2: Approval & Review (TeamLead Editable)</h3>

                    {/* Justification - Editable by TL */}
                    <h5>Justification of Procurement (Mandatory)</h5>
                    <textarea
                        name="justification_of_procurement"
                        className="form-control mb-3"
                        value={formData.justification_of_procurement}
                        onChange={handleChange}
                        required
                    />

                    
                    {/* Procurement TL Section - Checklist */}
                    <h4>For Office of Stores and Purchase only</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr><th colSpan="2" className="text-center">CHECKLIST</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { label: "1. Budget head specified", value: formData.checklist_budget_head_specified },
                                { label: "2. Availability of Space at Stores", value: formData.checklist_space_available },
                                { label: "3. Specifications enclosed", value: formData.checklist_specifications_enclosed },
                                { label: "4. Items working condition", value: formData.checklist_items_working_condition },
                                { label: "5. Any Deviation", value: formData.checklist_any_deviation }
                            ].map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.label}</td>
                                    <td>{item.value || "______________________"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mode of Purchase */}
                    <h5 className="mt-3"><b>MODE OF PURCHASE</b></h5>
                    <ul>
                        {["Direct Purchase (below 50 K)", "Three quotation basis (above 50 K to 5 Lac) Limited", "Tender Enquiry", "Open Tender Enquiry", "Repeat Order", "Proprietary"].map(option => (
                            <li key={option}>
                                {option} {formData.procurement_mode === option ? "(✓)" : ""}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2"><i>(Tick whichever is applicable)</i></p>

                    <p><b>Comments (if any):</b></p>
                    <p>{formData.procurement_comments || "_____________________________"}</p>
                    <p className="text-end"><b>Officer-in-Charge (Stores and Purchase)</b></p>

                    {/* PFC Section */}
                    <h5 className="mt-4 text-center">Constitution of Purchase Finalization Committee (PFC)</h5>
                    <table className="table table-bordered">
                        <tbody>
                            {[
                                { label: "Chairman (PI/CEO/PD/Nominated by Competent Authority)", value: formData.pfc_chairman },
                                { label: "Indenter", value: formData.pfc_indenter },
                                { label: "Expert 1 (Senior Employee/Nominated by Competent Authority)", value: formData.pfc_expert1 },
                                { label: "Expert 2 (Honorary Member/Nominated by Competent Authority)", value: formData.pfc_expert2 },
                                { label: "One Member from Finance Team (Nominated by Competent Authority)", value: formData.pfc_finance_member }
                                
                            ].map((row, idx) => (
                                <tr key={idx}><td>{row.label}</td><td>{row.value || "______________________"}</td></tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-end"><b>(Signature of Competent Authority)</b></p>

<h5 className="mt-4 text-center">Approval Section</h5>
<table className="table table-bordered">
    <tbody>
        <tr>
            <td><b>PI</b><br />(Up to Rs. 5 Lakh)<br /><small>Note: Non-Recurring: Rs. 50,000<br />Recurring: Rs. 5,00,000 (For Project Purchase)</small></td>
            <td><b>PROJECT DIRECTOR/CEO</b><br />(Up to Rs. 50 Lac)</td>
            <td><b>CHAIRMAN</b><br />(Full Power)</td>
        </tr>
    </tbody>
</table>

<h4>For Office of Accounts only</h4>
<table className="table table-bordered">
    <tbody>
        {["Budget allocation of the Office/Project", "Budget utilized", "Available balance", "Are funds available in the budget head requested by the Project/Office?", "Comments (if any)"].map((label, idx) => (
            <tr key={idx}><td>{label}</td><td>______________________</td></tr>
        ))}
    </tbody>
</table>
<p className="text-end"><b>Officer-in-Charge (Accounts)</b></p>

                    <div className="mt-4 d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                        <button className="btn btn-success" onClick={handleSubmit}>Submit to MD and TLs</button>
                    </div>
                </>
            )}
        </div>
    );
};
export default TeamLeadIndentForm;