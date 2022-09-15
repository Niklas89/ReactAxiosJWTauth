import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();

    useEffect(() => {
        // we get a memory leak from trying to set this state to an unmounted component 
        // video React Persistent User Login Authentication with JWT Tokens https://youtu.be/27KeYk-5vJw at 35min
        let isMounted = true; 

        // we want to run this only when authState is empty (after refresh the page and the state has been emptied)
        // so we can send the cookie to the refreshToken endpoint
        // we only want to run it when we lack an accessToken, only check refreshToken endpoint when it's needed
        const verifyRefreshToken = async () => {
            try {
                // reach out to the endpoint and take the cookie with it (function in useRefreshToken hook)
                // it sends the cookie to the refreshToken endpoint, this is what we need before we get to the
                // RequireAuth that will kick us back out
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                // wether we have an error or not this block is always going to run
                // this will prevent us from getting into this endless loading loop
                isMounted && setIsLoading(false);
            }
        }

        // persist added here AFTER tutorial video
        // Avoids unwanted call to verifyRefreshToken
        // if we don't have a refresh token we call this function verifyRefreshToken()
        // otherwise we setIsLoading to false
        !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    // another useEffect that we can remove later
    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
    }, [isLoading])

    // ReactFragment in the return
    // We can replace the "Loading..." to a component that is spinning for the loading
    // <Outlet /> represents all childs components or routes inside our PersistLogin route and
    // we're going to wrap this Outlet arround all our restricted/protected routes
    return (
        <> 
            {!persist /* if persist is false (user trust device is unchecked on login page) just go straight to those child components (components and routes) */
                ? <Outlet />
                : isLoading // otherwize check the isLoading if true show loading, if false show the outlet
                    ? <p>Loading...</p>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin