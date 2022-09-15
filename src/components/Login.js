import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import axios from '../api/axios';
const LOGIN_URL = '/user/login'; // login endpoint in backend nodejs api

const Login = () => {
    const { setAuth, persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    // navigate to the location where the user wanted to go before they were sent to the login page OR the home page
    const from = location.state?.from?.pathname || "/";

    // set focus on user input and error message
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    // when component loads set focus on first input field / user field
    useEffect(() => {
        userRef.current.focus();
    }, [])

    // make error message disapear when ajusting fields 
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent default behavior of the page which would reload of the page

        try {
            // post login file to backend api
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ email: user, password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response));
            const accessToken = response?.data?.accessToken;
            console.log(accessToken);
            const role = response?.data?.idRole;
            console.log(role);
            // auth state stored in our global context with the usecontext hook :
            setAuth({ user, pwd, role, accessToken }); 

            // clear components after submit complete
            setUser('');
            setPwd(''); 
            // after the form is submited, navigate to the location where the user wanted to go before they were sent to the login page
            navigate(from, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    const togglePersist = () => {
        setPersist(prev => !prev);
    }

    useEffect(() => { // store the persist state in localstorage 
        localStorage.setItem("persist", persist); // when the persist state changes that's when we want to store it in the localstorage
    }, [persist]) // [persist] : listen to when the persist state changes

    return (

        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="text"
                    id="email"
                    ref={userRef} // ref to set focus on this input
                    autoComplete="off" // not fill input with past entries
                    onChange={(e) => setUser(e.target.value)} // function to set user state
                    value={user} // user state in value
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>Sign In</button>
                <div className="persistCheck">
                    <input
                        type="checkbox"
                        id="persist"
                        onChange={togglePersist}
                        checked={persist}
                    />
                    <label htmlFor="persist">Trust This Device</label>
                </div>
            </form>
            <p>
                Need an Account?<br />
                <span className="line">
                    <Link to="/register">Sign Up</Link>
                </span>
            </p>
        </section>

    )
}

export default Login
