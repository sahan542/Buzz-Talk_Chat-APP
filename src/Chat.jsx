import { useContext, useEffect, useRef, useState } from "react"
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from "lodash";
import axios from "axios";
import Contact from "./Contact";


export default function Chat() {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offLinePeople, setOffLinePeople] = useState({});
    const [selecteduserId, setSelectedUserId] = useState(null);
    const {username, id, setId, setUsername} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
    }, [selecteduserId]);

    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 1000);
        });
    }
        

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        console.log({ev,messageData});
        if ('online' in messageData) {
          showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            if (messageData.sender === selecteduserId){
                setMessages(prev => ([...prev, {...messageData}]));
            }
        }
      }

      function logout(){
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        });
      }

      function sendMessage(ev, file = null) {
        if(ev)
        ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selecteduserId,
            text: newMessageText,
            file,
        }));

        if (file) {
            axios.get('/messages/'+selecteduserId).then(res => {
                setMessages(res.data);
            });
        }
        else {
            setNewMessageText('');
            setMessages(prev => ([...prev,{
              text: newMessageText,
              sender: id,
              recipient: selecteduserId,
              _id: Date.now(),
            }]));
          }
        
      }

      
      function sendFile(ev) {
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,

            });
        };
      }

      useEffect(() => {
        const div = divUnderMessages.current;
        if (div){
            div.scrollIntoView({behavior:'smooth', block:'end'});
        }
      }, [messages]);

      useEffect(() => {
            axios.get('/people').then(res => {
                const offLinePeopleArr = res.data
                    .filter(p => p._id !== id)
                    .filter(p => Object.keys(onlinePeople).includes(p._id));
                const offLinePeople = {};
                offLinePeopleArr.forEach(p => {
                    offLinePeople[p._id] = p;
                });
                setOffLinePeople(offLinePeople);
            });
      }, [onlinePeople]);

      useEffect(() => {
        if(selecteduserId){
            axios.get('/messages/'+selecteduserId).then(res => {
                setMessages(res.data);
            });
        }
      }, [selecteduserId]);

      const onlinePeopleExclOurUser = {...onlinePeople};
      delete onlinePeopleExclOurUser[id];

      console.log({onlinePeopleExclOurUser});

      const messagesWithoutDupes = uniqBy(messages, '_id');

    
      return (
        <div className="flex h-screen">
          <div className="bg-white w-1/3 flex flex-col">
            <div className="flex-grow">
            <Logo/>
            {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {setSelectedUserId(userId);console.log({userId})}}
              selected={userId === selecteduserId} />
          ))}

            {Object.keys(offLinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offLinePeople[userId].username}
              onClick={() => {setSelectedUserId(userId);console.log({userId})}}
              selected={userId === selecteduserId} />
          ))}

            </div>
            
          <div className="p-2 text-center flex items-center">
            <span className="mr-2 text-sm text-grey-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
              {username}
            </span>
                <button onClick={logout} className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">logout</button>     
          </div>

          </div>
          <div className="flex flex-col bg-blue-50 w-2/3 p-2">
            <div className="flex-grow">
                {!selecteduserId && (
                    <div className="flex h-full flex-grow items-center justify-center">
                        <div className="text-gray-400">&larr; Select a person from sidebar</div>
                    </div>
                )}

            {!!selecteduserId && (
                <div className="mb-4">
                <div className="relative h-full">
                    <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                    {messagesWithoutDupes.map(message => (
                        <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                            <div className={"text-left inline-block p-2 my-2 rounded-md text-sm" +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                sender: {message.sender}<br/>
                                my id: {id}<br/>
                                {message.text}
                                {message.file && (
                                    <div className="flex items-center gap-1">
                                        <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                        </svg>
                                        {message.file}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="h-12" ref={divUnderMessages}></div>
                </div>
                </div>
                </div>
            )}

        </div>



            {!!selecteduserId && (
                <form className="flex gap-2 mx-2" onSubmit={sendMessage}>
                <input
                  value={newMessageText}
                  onChange={ev => setNewMessageText(ev.target.value)}
                  type="text"
                  placeholder="Type your message here"
                  className="bg-white flex-grow border rounded-sm p-2"
                />
                <label type="button" className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-300">
                    <input type="file" className="hidden" onChange={sendFile} />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                </svg>

                </label>
                <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            )}
            
          </div>
        </div>
      );

}
