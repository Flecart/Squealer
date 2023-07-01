import { ISuccessMessage, IUser, UserRoles } from '@model/user';
import UserModel from '@db/user';
import { HttpError } from '@model/error';
import { MessageCreationMultipleChannels, type MessageCreation, type MessageCreationRensponse } from '@model/message';
import { HydratedDocument } from 'mongoose';
import { MessageService } from '@api/messages/messageService';
import { type IQuotas } from '@model/quota';
import UserService from '@api/user/userService';
import { HistoryService } from '@api/history/historyService';

export class SmmService {
    public async getClients(smmUsername: string): Promise<IUser[]> {
        const user = await this._getSmm(smmUsername);
        if (user.clients) {
            user.clients;
            const clients = UserModel.find({ username: { $in: user.clients } });
            return clients;
        }
        return [];
    }

    public async addClient(clientUsername: string, smmUsername: string): Promise<ISuccessMessage> {
        const user = await this._getSmm(smmUsername);

        const client = await UserModel.findOne({ username: clientUsername });
        if (client === null) {
            throw new HttpError(401, 'Client does not exist');
        }
        if (client.role !== UserRoles.VIP) {
            throw new HttpError(401, 'Client is not a VIP user');
        }
        if (user.clients !== undefined && user.clients.includes(clientUsername)) {
            throw new HttpError(401, 'Client already added');
        }

        if (user.clients === undefined) {
            user.clients = [clientUsername];
        } else {
            user.clients.push(clientUsername);
        }
        user.markModified('clients');
        await user.save();

        return { message: `Client ${clientUsername} added to ${smmUsername}` };
    }

    public async buyQuota(client: string, smmUsername: string, quota: IQuotas): Promise<ISuccessMessage> {
        if (!(await this._checkClient(client, smmUsername))) {
            throw new HttpError(401, 'Client not found');
        }
        return new UserService().purchaseQuota(client, quota.day, quota.week, quota.month);
    }

    public async getClient(smmUsername: string, clientUsername: string): Promise<IUser> {
        if (!(await this._checkClient(clientUsername, smmUsername))) {
            throw new HttpError(404, 'Client not found');
        }
        const client = await UserModel.findOne({ username: clientUsername });
        if (client === null) {
            throw new HttpError(404, 'Client not found');
        }
        if (client.role !== UserRoles.VIP) {
            throw new HttpError(401, 'Client is not a VIP user');
        }
        return client;
    }

    public async sendMessage(
        _smmUsername: string,
        clientUsername: string,
        message: MessageCreation,
    ): Promise<MessageCreationRensponse> {
        if (!(await this._checkClient(clientUsername, _smmUsername))) {
            throw new HttpError(404, 'Client not found');
        }
        return await new MessageService().create(message, clientUsername);
    }

    public async sendMessages(
        _smmUsername: string,
        clientUsername: string,
        messages: MessageCreationMultipleChannels,
    ): Promise<MessageCreationRensponse[]> {
        if (!(await this._checkClient(clientUsername, _smmUsername))) {
            throw new HttpError(404, 'Client not found');
        }

        const messagesToCreate: MessageCreation[] = messages.channels.map((channel) => {
            return {
                channel,
                parent: messages.parent,
                content: messages.content,
            } as MessageCreation;
        });

        return await new MessageService().createMultiple(messagesToCreate, clientUsername);
    }

    public async getClientHistory(smmUsername: string, clientUsername: string, from?: string, to?: string) {
        if (!(await this._checkClient(clientUsername, smmUsername))) {
            throw new HttpError(404, 'Client not found');
        }
        return new HistoryService().getHistory(clientUsername, from, to);
    }

    private async _checkClient(clientUsername: string, smmUsername: string): Promise<boolean> {
        const user = await this._getSmm(smmUsername);
        if (user.clients) {
            return user.clients.includes(clientUsername);
        }
        return false;
    }

    private async _getSmm(smmUsername: string): Promise<HydratedDocument<IUser>> {
        const user = await UserModel.findOne({ username: smmUsername });
        if (user === null) {
            throw new HttpError(401, 'User does not exist');
        }
        if (user.role !== UserRoles.SMM) {
            throw new HttpError(401, 'User is not a SMM');
        }
        return user;
    }
}
