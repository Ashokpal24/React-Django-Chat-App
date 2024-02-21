import React, { useState, useEffect } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomName, setRoomName] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        if (roomName) {
            const newWs = new WebSocket(`wss://silver-couscous-xqv4qqrpwxw345w-8000.app.github.dev/ws/${roomName}/`);
            setWs(newWs);
            newWs.onopen = () => {
                console.log('Connected to WebSocket');
            };

            newWs.onmessage = (evt) => {
                const msg = JSON.parse(evt.data)['message'];

                setMessages((prev) => {
                    return [...prev, msg]
                });
            };

            newWs.onclose = () => {
                console.log('Disconnected from WebSocket');
            };

            return () => {
                newWs.close();
            };
        }
    }, [roomName]);

    const createRoom = () => {
        setRoomName(input);
    };

    const sendMessage = () => {
        if (ws) {
            ws.send(JSON.stringify({ message: input }));
            setInput('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={createRoom}>Create Room</button>
        </div>
    );
};

export default Chat;
