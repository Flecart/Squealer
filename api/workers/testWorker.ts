//importScripts("./model/message.ts", "./api/messages/messageService.ts");
import { MessageService } from '@api/messages/messageService';
import { MessageCreation } from '@model/message';

var n = 0;

onmessage = function () {
    const message: MessageCreation = {
        content: {
            data: `messaggio ${n}`,
            type: 'text',
        },
        channel: 'test',
        parent: undefined,
    };

    n++;

    new MessageService().create(message, 'squealer');
};
