import { io, Socket } from 'socket.io-client';

// 1. Define the interface for data coming FROM the server
interface ServerToClientEvents {
    receive_message: (data: { id: string; text: string; timestamp: string }) => void;
}

// 2. Define the interface for data sending TO the server
interface ClientToServerEvents {
    send_message: (data: { text: string }) => void;
}

const SOCKET_URL = 'http://localhost:3000';

// 3. Create a strongly-typed socket instance
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
    autoConnect: false,
    // transportOptions:{
    //     extraHeaders:{
    //         authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg3MTYyNjU1LTU5ZDMtNDNhZC04MWZiLTFjMDEzM2FhNzgwOCIsImVtYWlsIjoid2ViemVyb25lQGdtYWlsLmNvbSIsInBob25lIjoiMDAyMDExMTA3NjkwMDAiLCJ1c2VyVHlwZSI6InJpZGVyIiwiaWF0IjoxNzgwNzkzNzczLCJleHAiOjE3ODA4ODAxNzN9.IV8mMCMEot7qqyRCIjiX09h6KT9e0O-ffpcTeHqxBvM',
    //     }
    // }
    transportOptions: {
        polling: {
            extraHeaders: {
                authorization:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNiZjk1OGIzLTFlNzYtNDI2NC1hYjMxLWFlNDkwZmM3YzA0OSIsImVtYWlsIjoid2ViemVyb25lQGdtYWlsLmNvbSIsInBob25lIjoiMDAyMDExMTA3NjkwMDAiLCJ1c2VyVHlwZSI6InJpZGVyIiwiaWF0IjoxNzgxNzE4MTU0LCJleHAiOjE3ODE4MDQ1NTR9.vj_YBywTOu5XmDjlVoWNm95nTadrcgylFPNQmi3RK50',
            },
        },
    },
});