import React, { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

// Interface for managing internal message state
interface Message {
    id: string;
    text: string;
    timestamp: string;
}

export default function ChatComponent(): React.JSX.Element {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>('');

    // Use a ref for the input to keep DOM manipulation efficient
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 1. Fetch current token and update headers dynamically before connecting
        //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNiZjk1OGIzLTFlNzYtNDI2NC1hYjMxLWFlNDkwZmM3YzA0OSIsImVtYWlsIjoid2ViemVyb25lQGdtYWlsLmNvbSIsInBob25lIjoiMDAyMDExMTA3NjkwMDAiLCJ1c2VyVHlwZSI6InJpZGVyIiwiaWF0IjoxNzgwODM5MjY0LCJleHAiOjE3ODA5MjU2NjR9.y9Q2h6-6wGPr9BJx3A7R35wblE9VRv_swqXxn3tj8LM';
        // socket.io.opts.extraHeaders = {
        //     authorization: token,
        // };

        // 2. Trigger connection
        socket.connect();

        // 3. Strongly-typed event handlers
        const onConnect = (): void => setIsConnected(true);
        const onDisconnect = (): void => setIsConnected(false);
        const onMessageReceived = (data: Message): void => {
            setMessages((prev) => [...prev, data]);
        };

        // 4. Bind listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', onMessageReceived);

        // 5. CLEANUP: Turn off listeners and sever socket connection on unmount
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_message', onMessageReceived);
            socket.disconnect();
        };
    }, []);

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Emit typed event payload to the server
        socket.emit('send_message', { text: inputValue });
        setInputValue('');

        // Maintain focus on the input field for user experience
        inputRef.current?.focus();
    };
    const updateLocation = ()=>{
        socket.emit('update_location',{longitude: '31.6015',latitude: '30.0062'})
        console.log('location updated')
    }
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Real-Time Chat</h2>

            {/* Visual Status Indicator */}
            <div style={{ marginBottom: '15px' }}>
                Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>

            {/* Messages Feed */}
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px',
                height: '300px',
                overflowY: 'auto',
                marginBottom: '15px',
                background: '#f9f9f9'
            }}>
                {messages.length === 0 ? (
                    <p style={{ color: '#888' }}>No messages yet...</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} style={{ marginBottom: '10px', fontSize: '14px' }}>
                            <strong style={{ color: '#333' }}>[{msg.timestamp}]</strong> {msg.text}
                        </div>
                    ))
                )}
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #aaa' }}
                />
                <button
                    type="submit"
                    disabled={!isConnected}
                    style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </form>
            <button type={'button'} onClick={updateLocation}>UpdateLocation</button>
        </div>
    );
}