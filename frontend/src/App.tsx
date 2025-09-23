import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import CustomerForm from "./components/CustomerForm";
import HomePage from "./components/Homepage";
import ExpiringPoliciesPage from "./components/ExpiringPoliciesPage";
import { CustomersProvider } from "./context/CustomersContext";

  function App() {

    return (
    <CustomersProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-customer" element={<CustomerForm />} />
        <Route path="/exp-policy" element={<ExpiringPoliciesPage/>} />

      </Routes>
    </Router>
    </CustomersProvider>
    );
  }

  export default App
