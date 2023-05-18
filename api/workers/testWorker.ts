//importScripts("./model/message.ts", "./api/messages/messageService.ts");
import { parentPort } from 'worker_threads';

var n = 0;
setInterval(function () {
    createMessage();
}, 10000);
function createMessage() {
    if (parentPort === null) console.log('parentPort is null');
    else parentPort.postMessage(++n);
}
