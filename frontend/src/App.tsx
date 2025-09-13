import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import CustomerForm from "./components/CustomerForm";
import ViewCustomer from "./components/ViewCustomer";
import HomePage from "./components/Homepage";

  function App() {

    return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/view/cust" element={<ViewCustomer />} />
        <Route path="/add-customer" element={<CustomerForm />} />
      </Routes>
    </Router>
    );
  }

  export default App
