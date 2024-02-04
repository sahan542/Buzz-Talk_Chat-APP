import axios from "axios";
import { useState } from "react";

export default function Register(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function register(ev){
        ev.preventDefault();
        await axios.post('/register', {username,password});
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={register}>
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
                <button className="bg-blue-500 text-white block w-full rounded-sm">Register</button>

            </form>
        </div>
    );
}