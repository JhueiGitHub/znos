import { Socket } from "../classes/socket.io";

export type ActionList = {
    slider?: { min: number; max: number; defaultValue: number; onValue: (args: number) => void; addon: number } | undefined;
    functions: { [key: string]: (() => void | true) | { function: () => void | true; disabled: () => boolean } };
};

export function ios(ip: string): Promise<{ socket: Socket; server: ActionList | undefined }> {
    return new Promise((resolve) => {
        // Mock implementation for now
        const socket: Socket = {
            id: Math.random().toString(36).substr(2, 9),
            on: (event: string, callback: (...args: any[]) => void) => {
                console.log(`Socket.on(${event})`);
            },
            emit: (event: string, ...args: any[]) => {
                console.log(`Socket.emit(${event})`, args);
            },
            disconnect: () => {
                console.log('Socket disconnected');
            }
        };
        
        resolve({ socket, server: undefined });
    });
}

export default function run(options: { onOpen: (uri: string, server: any) => void }): ActionList {
    // Mock server implementation
    setTimeout(() => {
        options.onOpen('mock-uri', { Code: 'MOCK123' });
    }, 100);
    
    return {
        functions: {}
    };
}
