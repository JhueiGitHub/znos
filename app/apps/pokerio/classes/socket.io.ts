// Socket.io wrapper for PokerIO
export type Socket = {
    id: string;
    on: (event: string, callback: (...args: any[]) => void) => void;
    emit: (event: string, ...args: any[]) => void;
    disconnect: () => void;
};

export async function io(uri: string): Promise<Socket> {
    // For now, return a mock socket
    return {
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
}
