import { IUser } from '@model/user';
import UserModel from '@db/user';
import { SmmBuyQuotaInput } from './smmController';
import { HttpError } from '@model/error';
import { MessageCreation } from '@model/message';

export class SmmService {
    public async getClients(_smmUsername: string): Promise<IUser[]> {
        // TODO: get clients from db

        return await UserModel.find({}).limit(3);
    }

    public async addClient(_clientUsername: string, _smmUsername: string): Promise<any> {
        // TODO: add client to db
        // Should:
        //  1. check if the requester (the client) is a vip user)
        // 2. check if both smm and client exist
        // 3. add client to smm's client list ez..
        return { success: true };
    }

    public async buyQuota(_input: SmmBuyQuotaInput, _smmUsername: string): Promise<any> {
        // Dovremmo basarci sull'altro buy quota, ma ricorda che qui il prezzo è maggiorato!
        throw new HttpError(500, 'Not implemented');
    }

    public async getQuota(_smmUsername: string, _clientUsername: string): Promise<any> {
        throw new HttpError(500, 'Not implemented');
    }

    public async getMaxQuota(_smmUsername: string, _clientUsername: string): Promise<any> {
        throw new HttpError(500, 'Not implemented');
    }

    public async sendMessage(_smmUsername: string, _clientUsername: string, _message: MessageCreation): Promise<any> {
        throw new HttpError(500, 'Not implemented');
    }
}
