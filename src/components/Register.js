import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from '../api/axios';
import { Link } from "react-router-dom";

// user: must start with lower or uppercase letter and must include 3-23 letters/digits/ - or _
// totally 4 to 24 characters
//const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/; 

// password: must include at least one lowercase letter, one uppercase letter, one digit and one special
// must be from 8 to 24 characters
//const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; 
const PWD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*#?&\/]{6,50}$/;

// endpoint for our registration in our backend api
const REGISTER_URL = '/user/register';

const Register = () => {
    const userRef = useRef(); // focus on user input when component loads
    const errRef = useRef(); // error reference, when we get an error we must be focused on it

    // state for the user field
    const [user, setUser] = useState(''); // user email input
    const [validName, setValidName] = useState(false); // boolean if name validates or not
    const [userFocus, setUserFocus] = useState(false); // boolean if focus on user field or not

    // password state
    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    // match password state
    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // error message state
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => { // set focus on user email input when component loads
        userRef.current.focus(); // reference userRef on user input
    }, [])

    useEffect(() => {
        setValidName(EMAIL_REGEX.test(user));
    }, [user]) // user email is inside the dependency array, so anytime it changes it will check validation of that field

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    // when state of user,pwd or matchpwd change the error message is cleared
    // because the user has read the message already and is typing new details
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    // submit event for the form 
    const handleSubmit = async (e) => {
        e.preventDefault();
        // if submit button enabled with JS hack, test regex validation again
        const v1 = EMAIL_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try { // post to backend api registration endpoint
            const response = await axios.post(REGISTER_URL,
                // if same name on frontend and backend: JSON.stringify({ user, pwd }),
                JSON.stringify({ firstName: "test", lastName: "test", email: user, password: pwd, idRole: 1 }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            // TODO: remove console.logs before deployment
            console.log(JSON.stringify(response?.data)); // response from server
            console.log(response.accessToken); // check access token    
            //console.log(JSON.stringify(response))
            setSuccess(true);
            //clear state and controlled inputs
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Email Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus(); // set focus on error message
        }
    }

    // if success sign up, then show sign in link and success message. Otherwize show sign up form.
    return (
        <>
            {success ? (
                <section>
                    <h1>Success!</h1>
                    <p>
                        <a href="#">Sign In</a>
                    </p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Register</h1>
                    <form onSubmit={handleSubmit}> {/* submit event for the form */}
                        <label htmlFor="email"> {/* htmlFor needs to match the id of the input */}
                            Email:
                            {/*  if valid user: show faCheck icon, else hide */}
                            <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                            {/*  if valid user or user state false (nothing in input): hide faTimes icon, else display red X next to label */}
                            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="text"
                            id="email" // should match htmlFor in the label
                            ref={userRef} // reference to set focus on the input
                            autoComplete="off" // we don't want previous values selected for this field
                            onChange={(e) => setUser(e.target.value)} // ties the input to the user state
                            value={user}
                            required
                            aria-invalid={validName ? "false" : "true"} // if user email is valid : false  - helps required
                            aria-describedby="uidnote" // requirements of the input
                            onFocus={() => setUserFocus(true)} // focus true when enter input field
                            onBlur={() => setUserFocus(false)} // focus to false if we leave the input field
                        />

                        {/* if input user field is focused and user state is not empty (we have entered something in the field)
                        and if field is not valid we will show this message. If valid ? offscreen: taken off the screen with an absolute position in css */}
                        <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            4 to 24 characters.<br />
                            Must begin with a letter.<br />
                            Letters, numbers, underscores, hyphens allowed.
                        </p>


                        <label htmlFor="password">
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            // no focus on pass field when page loads
                            type="password" // autocomplete not supported on type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        {/*  display pass note when we set focus on password field and password regex not valid */}
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must include uppercase and lowercase letters, a number and a special character.<br />
                            Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </p>


                        <label htmlFor="confirm_pwd">
                            Confirm Password:
                            {/*  must have valid match regex and matchpwd state must be true for faCheck icon to show */}
                            <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby="confirmnote"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Must match the first password input field.
                        </p>

                        {/*  button disabled until all the fields are validated  */}
                        <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>
                    </form>
                    <p>
                        Already registered?<br />
                        <span className="line">
                            {/*  react router link for sign in form */}
                            <Link to="/">Sign In</Link>
                        </span>
                    </p>
                </section>
            )}
        </>
    )
}

export default Register
