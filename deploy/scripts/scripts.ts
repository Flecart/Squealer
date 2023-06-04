/* eslint-disable */
// This scripts initializes the server and starts listening for requests

import mongoose from 'mongoose';
import request from 'supertest';
import initConnection from '../../server/mongo';
import { randomBattisti, randomGuccini } from './readscript'

import dotenv from 'dotenv';
import { ChannelInfo, ChannelType } from '../../model/channel';

dotenv.config({
    path: './.env',
});

const createUserRoute = "/api/auth/create"
const loginRoute = "/api/auth/login"
const channelCreateRoute = "/api/channel/create"
const messageCreateRoute = "/api/message"
const baseUrl = "http://localhost:3000"

type Credentials = {
    username: string
    password: string
}

const allUsers = ['gio', 'angi', 'luchi']

type MessageCreate = {
    id: string,
    token: string,
}
let publicChannel = [
    {
        nome: 'battisti', description: 'canale dedicato a lucio battisti',
        gen: randomBattisti, members: []
    },
    {
        nome: 'guccini', description: 'canale dedicato a francesco guccini',
        gen: randomGuccini, members: []
    },
]

function createCredentials(user: string) {
    return {
        username: user,
        password: user,
    } as Credentials
}

async function createDefaultUsers() {
    const promises = allUsers.map((user) => {
        const creds: Credentials = createCredentials(user);
        return request(baseUrl)
            .post(createUserRoute)
            .send(creds)
            .expect(201)
    });
    await Promise.all(promises)
    console.log("Users created")
}

async function getLoginTokens() {
    const loginTokens: string[] = []

    const promises = allUsers.map((user) => {
        const creds = createCredentials(user);

        return request(baseUrl)
            .post(loginRoute)
            .send(creds)
            .expect(200)

    })

    const res = await Promise.all(promises)
    res.forEach((res) => {
        loginTokens.push(res.body.token.trim())
    })

    console.log(`Login tokens: \n${loginTokens.map((token, i) => {
        return `${allUsers[i]}: ${token}\n`
    }).join('')}`)
    return loginTokens
}

async function createChannels(loginToken: string[]) {
    for (let channel of publicChannel) {
        const channelInfo = {
            channelName: channel.nome,
            type: ChannelType.PUBLIC,
            description: channel.description,
        } as ChannelInfo


        if (loginToken[0] === undefined) {
            throw new Error("No login tokens")
        } else {
            await createChannel(loginToken[0], channelInfo);
        }
    }
}

async function createChannel(loginToken: string, channel: ChannelInfo) {
    return await request(baseUrl)
        .post(channelCreateRoute)
        .set('Authorization', `Bearer ${loginToken}`)
        .send(channel)
        .expect(201)
}

async function createMessagesPublic(): Promise<MessageCreate[]> {
    const message = publicChannel.map(async (channel) => {
        let messages: MessageCreate[] = [];
        for (let token of channel.members) {
            const message = {
                channel: channel.nome,
                content: {
                    type: 'text',
                    data: channel.gen(),
                },
            }
            const req = await request(baseUrl)
                .post(messageCreateRoute)
                .set('Authorization', `Bearer ${token}`)
                .field('data', JSON.stringify(message)).expect(200);
            messages.push({ id: req.body.id, token } as MessageCreate);
        }
        return messages;
    });
    const messageCreate = await Promise.all(message);
    return messageCreate.filter((message) => message !== undefined).flat() as MessageCreate[];
}

async function createRensponse(messages: MessageCreate[], loginTokens: string[]) {
    const promises = messages.map(async (cmessage) => {
        for (let token of loginTokens) {
            if (cmessage.token === token) continue;
            const message = {
                parent: cmessage.id,
                content: {
                    type: 'text',
                    data: randomBattisti(),
                },
            }
            const rens = await request(baseUrl)
                .post(messageCreateRoute)
                .set('Authorization', `Bearer ${token}`)
                .field('data', JSON.stringify(message)).expect(200);
            if(rens.status !== 200) console.log(rens.text)

        }
    });
    await Promise.all(promises);
}

async function joinChannel(){
    for(let channel of publicChannel){
        for(let token of channel.members){
            await request(baseUrl)
                .post(`/api/channel/${channel.nome}/join`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        }
    }
}

initConnection().then(async () => {
    await mongoose.connection.db.dropDatabase() // tanto nessuna informazione importante è presente, è sicuro droppare così
    console.log("Database dropped")
    mongoose.connection.close()

    await createDefaultUsers();
    const loginToken = await getLoginTokens();



    await createChannels(loginToken);
    console.log("Channels created")

    // @ts-ignore
    publicChannel[0].members = [loginToken[0], loginToken[1]];
    // @ts-ignore
    publicChannel[1].members = [loginToken[0], loginToken[1], loginToken[2]];

    await joinChannel();
    console.log("Users joined channels")

    const message = await createMessagesPublic();
    console.log("Messages created")

    await createRensponse(message, loginToken);
})
