// src/components/ProtectedRoute.tsx
import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('access');
    return token ? <>{children}</> : <Navigate to="/get-started" replace />;
};

export default ProtectedRoute;
