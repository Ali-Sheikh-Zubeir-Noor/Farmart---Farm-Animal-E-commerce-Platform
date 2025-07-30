import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;