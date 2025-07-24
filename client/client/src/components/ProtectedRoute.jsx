import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


export default function RoleProtectedRoute({children, allowedRoles}){
    const token = localStorage.getItem('token');

    if(!token){
        return <Navigate to="/login" replace />;
    }
    return children;

}
