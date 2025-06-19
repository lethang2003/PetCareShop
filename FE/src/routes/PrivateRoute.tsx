import { Navigate } from 'react-router-dom';
import React from 'react'; // In case you're using React 17 or lower
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

interface PrivateRouteProps {
    element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
    const user = useSelector((state: RootState) => state.user);
    const allowedRoles = ['admin', 'staff', 'manager'];
    const isAllowed = allowedRoles.includes(user.role.toLowerCase());

    if (!isAllowed) {
        return <Navigate to="/auth/login" />;
    }

    return element;
};


export default PrivateRoute;