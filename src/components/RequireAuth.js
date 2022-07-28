import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// RequireAuth component can protect any child component that are nested inside of it
const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return ( // check if user is logged in and his role
    // auth.role is the role of the logged in user that is stored in our auth state, allowedRoles is array that is passed in this component and we're trying to match the values
         // check if allowedRoles array includes the role that is beeing passed, to let user view page
        allowedRoles?.find(role => role === auth?.role)
            ? <Outlet /> // Outlet component represents any child component of RequireAuth component
            : auth?.user // else if role not authorized, redirect to unauthorized page, else if not a valid user to login page. 
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
                // enable the user to go back to navigation history where he came from (from: location)
                // if the user wants to come back to his previous page. Without from: location he can't go back.
    );
}

export default RequireAuth;