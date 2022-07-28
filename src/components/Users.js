import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
// import useRefreshToken from "../hooks/useRefreshToken";

const Users = () => {
    const [users, setUsers] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    // const refresh = useRefreshToken();

    // useEffect when component loads
    useEffect(() => {
        let isMounted = true;

        // cancel our request if the component unmounts
        const controller = new AbortController();

        const getUsers = async () => {
            try {
                const response = await axiosPrivate.get('/user', {
                    signal: controller.signal
                });
                console.log(response.data);
                isMounted && setUsers(response.data);
            } catch (err) {
                console.error(err);
                navigate('/login', { state: { from: location }, replace: true });
            }
        }

        getUsers();

        // cleanup function runs as the component unmounts
        return () => {
            isMounted = false;
            controller.abort(); // cancel any request that we have pending when the component unmounts
        }
    }, [])

    return (
        <article>
            <h2>Users List</h2>
            {users?.length // list out the users that are in the users state 
                ? (
                    <ul> {/* each user and their index in the array: list firstname and lastname */}
                        {users.map((user, i) => <li key={i}>{user?.firstName} {user?.lastName}</li>)}
                    </ul>
                ) : <p>No users to display</p>
            }
            {/* <button onClick={() => refresh()}>Refresh</button> */}
        </article>
    );
};

export default Users;
