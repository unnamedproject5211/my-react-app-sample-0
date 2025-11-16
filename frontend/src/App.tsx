// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import CustomerForm from "./components/CustomerForm";
import HomePage from "./components/Homepage";
import ExpiringPoliciesPage from "./components/ExpiringPoliciesPage";
import EditCustomerPage from "./components/EditCustomerPage";
import VerifyOtp from "./components/VerifyOtp";
import { CustomersProvider } from "./context/CustomersContext";
// Auth pages
import Login from "./components/Login";
import Register from "./components/Register";
// ProtectedRoute wrapper
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    console.log("Vercel ENV Test:", import.meta.env.VITE_BACKEND_URL);
  return (
    <CustomersProvider>
      <Router>
        <Routes>
          {/* Default route: show Register page first */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp/>} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-customer"
            element={
              <ProtectedRoute>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exp-policy"
            element={
              <ProtectedRoute>
                <ExpiringPoliciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditCustomerPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect any unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CustomersProvider>
  );
}

export default App;
