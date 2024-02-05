import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

    async function handleSubmit(ev){
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'register': 'login';
        const {data} = await axios.post(url, {username,password});
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input 
                    type ="text"
                    placeholder="username"
                    value={username}
                    className="block w-full rounded-sm p-2 mb-2 border" 
                    onChange={ev => setUsername(ev.target.value)}         
                />
                <input 
                    type ="password"
                    placeholder="password"
                    value={password}
                    className="block w-full rounded-sm p-2 mb-2 border"   
                    onChange={ev => setPassword(ev.target.value)}            
                />
                <button className="bg-blue-500 text-white block w-full rounded-sm">
                    {isLoginOrRegister === 'register' ? 'register' : 'login'}
                </button>
                <div className="text-center mt-2">
                   
                    {isLoginOrRegister === 'register' && (
                        <div>
                             Already a member? 
                            <button onClick={() => setIsLoginOrRegister('login')}>
                                Login here
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                        Dont have an account? 
                       <button onClick={() => setIsLoginOrRegister('register')}>
                           Register here
                       </button>
                   </div>
                    )}
                    
                </div>

            </form>
        </div>
    );
}