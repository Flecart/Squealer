let notification: string[] = [];
let listeners: Array<() => void> = [];
export const NotificationStore = {
    setNotification(newNotification: string[]) {
        if (notification.length === newNotification.length && notification.every((v, i) => v === newNotification[i]))
            return;
        notification = newNotification;
        emitChange();
    },
    subscribe(listener: () => void): () => void {
        listeners = [...listeners, listener];
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
    getSnapshot() {
        return notification;
    },
};

function emitChange(): void {
    for (const listener of listeners) {
        listener();
    }
}
