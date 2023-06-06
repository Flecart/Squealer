import { MessageService } from '@api/messages/messageService';
import { type MessageCreation } from '@model/message';
import { type ITemporizzati } from '@model/temporizzati';
import { HttpError } from '@model/error';
import TemporizzatiModel from '@db/temporizzati';
import UserModel from '@db/user';

export class TemporizzatiService {
    public async getTemporizzati(username: string): Promise<ITemporizzati[]> {
        return await TemporizzatiModel.find({ creator: username });
    }

    public async create(temporizzati: ITemporizzati): Promise<ITemporizzati> {
        const creator = await UserModel.findOne({ username: temporizzati.creator });
        if (!creator) {
            throw new HttpError(404, 'Username not found');
        }
        const obj = await TemporizzatiModel.create(temporizzati);
        await obj.save();
        TemporizzatiService.create(obj._id.toString(), temporizzati);
        return obj;
    }

    static jobs: Map<string, [NodeJS.Timeout, number]> = new Map();

    private static fromITemporizztiToMessageCreation(temporizzati: ITemporizzati, iteration: number): MessageCreation {
        let content = temporizzati.content;
        if (temporizzati.type === 'text') {
            content = temporizzati.content as string;
            content.replace('{TIME}', new Date().toLocaleTimeString());
            content.replace('{DATE}', new Date().toLocaleDateString());
            content.replace('{NUM}', iteration.toString());
        }
        return {
            channel: temporizzati.channel,
            parent: undefined,
            content: {
                type: temporizzati.type,
                data: content,
            },
        };
    }

    public static create(id: string, temporizzati: ITemporizzati) {
        if (this.jobs.has(id)) {
            throw new HttpError(400, 'Temporizzato già esistente');
        }
        const timer = setInterval(() => {
            const current = this.jobs.get(id);
            try {
                const messageCreate = this.fromITemporizztiToMessageCreation(temporizzati, current[1]);
                new MessageService().create(messageCreate, temporizzati.creator);
            } catch (e) {
                console.log(e);
                TemporizzatiService.delete(id);
            }
            if (current !== undefined) {
                this.jobs.set(id, [current[0], current[1] + 1]);
                if (current[1] + 1 >= temporizzati.iterazioni) {
                    TemporizzatiService.delete(id);
                }
            }
        }, temporizzati.periodo * 1000);
        this.jobs.set(id, [timer, 0]);
    }

    public static delete(id: string) {
        const current = this.jobs.get(id);
        if (current !== undefined && current[0] !== undefined) {
            clearInterval(current[0]);
            this.jobs.delete(id);
        }
        TemporizzatiModel.findOne({ _id: id }).then((temporizzati) => {
            if (temporizzati === null) return;
            temporizzati.running = false;
            temporizzati.save();
        });
    }
}
