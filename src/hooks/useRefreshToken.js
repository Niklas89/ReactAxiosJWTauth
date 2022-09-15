import axios from '../api/axios';
import useAuth from './useAuth';

// we will call this request when our initial request fails, when our accesstoken is expired
// then it will refresh, get a new token, and we will retry the request.
const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true 
            // this is the setting that allows us to send cookies with our request
            // the request is going to send the secure cookie (not accessible with javascript) that has the response token. 
            // Axios sends it to the backend endpoint
        });
        setAuth(prev => { // previous state
            console.log(JSON.stringify(prev));
            // accesstoken that we get back after our refresh token is verified
            console.log(response.data.accessToken); 
            // return the previous state and override the accesstoken with the new accesstoken
            return { 
                ...prev, 
                role: response.data.idRole, // we add role for the PersistLogin function, we get it at login normally
                accessToken: response.data.accessToken }
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;
