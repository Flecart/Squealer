import { Worker } from 'worker_threads';
import { MessageService } from '@api/messages/messageService';
import { MessageCreation } from '@model/message';

export function mkWorkerTest() {
    const worker = new Worker('./build/api/workers/testWorker.js');
    worker.on('message', (n) => {
        const message: MessageCreation = {
            content: {
                data: `messaggio ${n}`,
                type: 'text',
            },
            channel: 'battisti',
            parent: undefined,
        };

        try {
            new MessageService().create(message, 'gio').then((res) => {
                console.log(res);
            });
        } catch (e) {
            console.log(e);
        }
    });
    worker.on('error', (err) => {
        console.log('error from worker', err);
    });
}
