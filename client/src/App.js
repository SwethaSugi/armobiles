import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Repairs from './pages/Repairs';
import Billing from './pages/Billing';
import BillingList from './pages/BillingList';
import BillView from './pages/BillView';
import ShopSettings from './pages/ShopSettings';
import ChangePassword from './pages/ChangePassword';
import Others from './pages/Others';
import OtherCategories from './pages/OtherCategories';
import Placeholder from './pages/Placeholder';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/repairs" 
            element={
              <ProtectedRoute>
                <Repairs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing/list" 
            element={
              <ProtectedRoute>
                <BillingList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing/view/:id" 
            element={
              <ProtectedRoute>
                <BillView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/others" 
            element={
              <ProtectedRoute>
                <Others />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/other-categories" 
            element={
              <ProtectedRoute>
                <OtherCategories />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shop-settings" 
            element={
              <ProtectedRoute>
                <ShopSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;