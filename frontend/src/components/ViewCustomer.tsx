import React from "react";
import { useNavigate } from "react-router-dom";
import "./ViewCustomer.css";

interface Customer {
  id: string;
  name: string;
}

const ViewCustomer: React.FC = () => {
  const navigate = useNavigate();

  // Dummy data for now (you can replace with API call later)
  const customers: Customer[] = [
    { id: "CUST001", name: "John Doe" },
    { id: "CUST002", name: "Jane Smith" },
    { id: "CUST003", name: "Michael Johnson" },
  ];

  const handleEdit = (id: string) => {
    // Navigate to the form page and pass customer id
    navigate(`/form/${id}`);
  };

  return (
    <div className="view-customer-container">
      <h2>Customer List</h2>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>View & Edit</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(customer.id)}
                >
                  View & Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewCustomer;
