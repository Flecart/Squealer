import { MessageService } from '@api/messages/messageService';
import { type MessageCreation } from '@model/message';
import { type ITemporizzati } from '@model/temporizzati';
import { HttpError } from '@model/error';
import TemporizzatiModel from '@db/temporizzati';
import UserModel from '@db/user';
import { type ContentInput } from '@api/temporizzati/temporizzatiController';

type TimerCount = {
    interval: NodeJS.Timeout;
    numIter: number;
};

type WikiReponse = {
    year: string;
    text: string;
};

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
        const obj = await new TemporizzatiModel({
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
            content.data = (temporizzati.content.data as string).replace('{TIME}', new Date().toLocaleTimeString());
            content.data = (temporizzati.content.data as string).replace('{DATE}', new Date().toLocaleDateString());
            content.data = (temporizzati.content.data as string).replace('{NUM}', iteration.toString());
        } else if (temporizzati.content.type === 'wikipedia') {
            content.type = 'text';
            content.data = await TemporizzatiService._getWikipediaContent();
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
        const timer = setInterval(async () => {
            const current = this.jobs.get(id) as TimerCount;
            try {
                const messageCreate = await TemporizzatiService.fromITemporizzatiToMessageCreation(
                    temporizzati,
                    current.numIter,
                );
                new MessageService().create(messageCreate, temporizzati.creator);
            } catch (e) {
                console.log(e);
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
            numIter: 0,
        });
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

    private static async _getWikipediaContent(): Promise<string> {
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
}
