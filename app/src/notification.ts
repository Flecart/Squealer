import { type NotificationRensponse } from '@model/user';

let notification: NotificationRensponse = {
    message: [],
    invitation: [],
};

let listeners: Array<() => void> = [];

export const NotificationStore = {
    setNotification(newNotification: NotificationRensponse) {
        if (
            notification.message.length === newNotification.message.length &&
            notification.message.every((v, i) => v === newNotification.message[i]) &&
            notification.invitation.length === newNotification.invitation.length &&
            notification.invitation.every((v, i) => v === newNotification.invitation[i])
        )
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
