import { MessageService } from '@api/messages/messageService';
import { type MessageCreation } from '@model/message';
import { type ITemporizzati } from '@model/temporizzati';
import { HttpError } from '@model/error';
import TemporizzatiModel from '@db/temporizzati';
import UserModel from '@db/user';
import { type ContentInput } from '@model/temporizzati';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import logger from '@server/logger';

type TimerCount = {
    interval: NodeJS.Timeout;
    numIter: number;
};

type WikiReponse = {
    year: string;
    text: string;
};

const tempLogger = logger.child({ module: 'Temporizzati' });

export class TemporizzatiService {
    static jobs: Map<string, TimerCount> = new Map();

    public async getTemporizzati(username: string): Promise<ITemporizzati[]> {
        return await TemporizzatiModel.find({ creator: username });
    }

    public async create(temporizzati: ContentInput, username: string): Promise<ITemporizzati> {
        const creator = await UserModel.findOne({ username: username });
        if (!creator) {
            throw new HttpError(404, 'Username not found');
        }

        if (temporizzati.iterazioni <= 0) {
            throw new HttpError(400, 'Iterazioni deve essere maggiore di 0');
        }

        const obj = new TemporizzatiModel({
            creator: username,
            channel: temporizzati.channel,
            content: temporizzati.content,
            iterazioni: temporizzati.iterazioni,
            periodo: temporizzati.periodo,
            running: true,
        });
        await obj.save();
        TemporizzatiService.create(obj._id.toString(), obj);
        return obj;
    }

    public async getUser(username: string): Promise<ITemporizzati[]> {
        return await TemporizzatiModel.find({ creator: username });
    }

    private static async fromITemporizzatiToMessageCreation(
        temporizzati: ITemporizzati,
        iteration: number,
    ): Promise<MessageCreation> {
        let content: MessageCreation['content'] = {
            type: 'text',
            data: '',
        };
        if (temporizzati.content.type === 'text') {
            let data = temporizzati.content.data as string;
            data = data
                .replace('{TIME}', new Date().toLocaleTimeString())
                .replace('{DATE}', new Date().toLocaleDateString())
                .replace('{NUM}', iteration.toString());
            content.data = data;
        } else if (temporizzati.content.type === 'wikipedia') {
            content.type = 'text';
            content.data = await TemporizzatiService.getWikipediaContent();
        } else if (temporizzati.content.type === 'image') {
            content.type = 'image';
            content.data = await TemporizzatiService.getImageContent();
        } else if (temporizzati.content.type === 'maps') {
            throw new HttpError(400, 'Not implemented');
        }

        return {
            channel: temporizzati.channel,
            parent: undefined,
            content: content,
        };
    }

    public static create(id: string, temporizzati: ITemporizzati) {
        if (this.jobs.has(id)) {
            throw new HttpError(400, 'Temporizzato già esistente');
        }

        const createMessage = async (currentIteration: number) => {
            const messageCreate = await TemporizzatiService.fromITemporizzatiToMessageCreation(
                temporizzati,
                currentIteration,
            );
            new MessageService().create(messageCreate, temporizzati.creator);
        };

        createMessage(0); // primo messaggio è immediato in questo modo.

        const timer = setInterval(async () => {
            const current = this.jobs.get(id) as TimerCount;
            tempLogger.info(
                `Creating new message for temporizzato ${id}, iteration ${current.numIter}, period ${temporizzati.periodo}`,
            );
            try {
                await createMessage(current.numIter);
            } catch (e) {
                tempLogger.error(e);
                TemporizzatiService.delete(id);
            }
            if (current !== undefined) {
                current.numIter++;
                this.jobs.set(id, current);
                if (current.numIter >= temporizzati.iterazioni) {
                    TemporizzatiService.delete(id);
                }
            }
        }, temporizzati.periodo);

        this.jobs.set(id, {
            interval: timer,
            numIter: 1,
        });
    }

    public static async deleteFromApi(id: string, username: string): Promise<void> {
        const temporizzato = await TemporizzatiModel.findOne({ _id: id });
        if (temporizzato === null) return;
        if (temporizzato.creator !== username) throw new HttpError(401, 'Unauthorized');
        temporizzato.running = false;
        temporizzato.save();
        const current = this.jobs.get(id);
        if (current !== undefined && current.interval !== undefined) {
            clearInterval(current.interval);
            this.jobs.delete(id);
        }
    }

    public static delete(id: string) {
        const current = this.jobs.get(id);
        if (current !== undefined && current.interval !== undefined) {
            clearInterval(current.interval);
            this.jobs.delete(id);
        }
        TemporizzatiModel.findOne({ _id: id }).then((temporizzati) => {
            if (temporizzati === null) return;
            temporizzati.running = false;
            temporizzati.save();
        });
    }

    public static async getWikipediaContent(): Promise<string> {
        const randomElements = ['births', 'deaths', 'events', 'holidays']; // from https://en.wikipedia.org/api/rest_v1/#/Feed/onThisDay
        const randomElement: string = randomElements[Math.floor(Math.random() * randomElements.length)] as string;

        // format MM-DD
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const endpointUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/${randomElement}/${month}/${day}`;

        const response = await fetch(endpointUrl);
        const json = await response.json();

        const data = json[randomElement];
        const event = data[Math.floor(Math.random() * data.length)] as WikiReponse;

        let messageText = `Did you know that on this day (${month}/${day}): `;
        switch (randomElement) {
            case 'births':
                messageText += ` was born in ${event.year} ${event.text}?`;
                break;
            case 'deaths':
                messageText += ` died in ${event.year} ${event.text}?`;
                break;
            case 'events':
                messageText += ` in ${event.year} ${event.text}?`;
                break;
            case 'holidays':
                messageText += ` is ${event.text}?`;
                break;
        }

        return messageText;
    }

    public static async getImageContent(): Promise<Express.Multer.File> {
        const response = await fetch('https://picsum.photos/1000');
        const buffer = Buffer.from(await response.arrayBuffer());

        return {
            fieldname: 'image',
            originalname: uuidv4() as string,
            mimetype: 'image/jpeg',
            buffer: buffer,
            size: buffer.byteLength,
        } as Express.Multer.File;
    }
}
