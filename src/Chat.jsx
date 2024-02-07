import { useContext, useEffect, useRef, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from 'lodash/uniqBy';


export default function Chat() {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selecteduserId, setSelectedUserId] = useState(null);
    const {username, id} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState(null);
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

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
            setMessages(prev => ([...prev, {...messageData}]));
        }
      }

      function sendMessage(ev) {
        ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selecteduserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev => ([...prev,{
            text: newMessageText,
            sender:id,
            recipient: selecteduserId,
            id: Date.now(),
            }]));
            const div = divUnderMessages.current;
            console.log(div);
            div.scrollIntoView({behavior:'smooth', block:'end'});
      }

      const onlinePeopleExcluOurUser = {...onlinePeople};
      delete onlinePeopleExcluOurUser[id];

      const messagesWithoutDupes = uniqBy(messages, '_id');

    
      return (
        <div className="flex h-screen">
          <div className="bg-white w-1/3 ">
                <Logo/>
            {Object.keys(onlinePeopleExcluOurUser).map((userId, index) => (
              <div onClick={() => setSelectedUserId(userId)} className={"border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer "+(userId === selecteduserId ? 'bg-blue-200' : '')} key={index}>
                {userId === selecteduserId && (
                    <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                )}
                    <div className="flex gap-2 py-2 pl-4 items-center">
                    <Avatar username={onlinePeople[userId]} userId={userId} />
                    <span className="text-gray-800">{onlinePeople[userId]}</span>
                    </div>
              </div>
            ))}
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
                    <div className="overflow-y-scroll absolute inset-0">
                    {messagesWithoutDupes.map(message => (
                        <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                            <div className={"text-left inline-block p-2 my-2 rounded-md text-sm" +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                sender: {message.sender}<br/>
                                my id: {id}<br/>
                                {message.text}
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