/* eslint-disable */
// This scripts initializes the server and starts listening for requests

import mongoose from 'mongoose';
import request from 'supertest';
import initConnection from '../../server/mongo';
import { randomBattisti, randomGuccini } from './readscript'

import dotenv from 'dotenv';
import { ChannelInfo, ChannelType, PermissionType } from '../../model/channel';
import { MapPosition, Maps } from '@model/message';
import assert from 'node:assert'

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

type LoginToken = { name: string, token: string }

let loginTockenMap: Map<string, string> = new Map();

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
let privateChannel = [
    {
        nome: 'battistiQuote', description: 'canale dedicato a lucio battisti',
        gen: randomBattisti, members: []
    },
    {
        nome: 'gucciniQuote', description: 'canale dedicato a francesco guccini',
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

async function getLoginTokens(): Promise<LoginToken[]> {
    const loginTokens: LoginToken[] = []

    const promises = allUsers.map((user) => {
        const creds = createCredentials(user);
        return request(baseUrl)
            .post(loginRoute)
            .send(creds)
            .expect(200)
    })

    const res = await Promise.all(promises)
    res.forEach((res, i) => {
        loginTokens.push({
            name: allUsers[i] as string,
            token: res.body.token.trim()
        });
    })

    console.log(`Login tokens: \n ${JSON.stringify(loginTokens)}`)
    return loginTokens;
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

async function createGeolocationMessagesPublic() {
    const channel = "guccini"
    // @ts-ignore
    const tokenSender = publicChannel[1].members[0];

    const firstPosition: Maps = {
        positions: [{
            lat: 44.498026,
            lng: 11.355863,
        }]
    }

    const nextPositions: MapPosition[] = [
        {
            lat: 44.498206,
            lng: 11.35593,
        },
        {
            lat: 44.498369,
            lng: 11.35546,
        },
    ]

    const message = {
        channel: channel,
        content: {
            type: 'maps',
            data: firstPosition,
        },
    }

    const req = await request(baseUrl)
        .post(messageCreateRoute)
        .set('Authorization', `Bearer ${tokenSender}`)
        .field('data', JSON.stringify(message)).expect(200);

    console.log(req.body)
    for (let position of nextPositions) {
        const req2 = await request(baseUrl)
            .post(`${messageCreateRoute}/geo/${req.body.id}`)
            .set('Authorization', `Bearer ${tokenSender}`)
            .send(position).expect(200);

        console.log(req2.body)
    }
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
            if (rens.status !== 200) console.log(rens.text)

        }
    });
    await Promise.all(promises);
}

async function joinChannel() {
    for (let channel of publicChannel) {
        for (let token of channel.members) {
            await request(baseUrl)
                .post(`/api/channel/${channel.nome}/join`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        }
    }
}

async function createTemporalMessage() {
    const channel = "guccini"
    // @ts-ignore
    const tokenSender = publicChannel[1].members[0];

    await request(baseUrl)
        .post("/api/temporizzati")
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
            channel: channel,
            content: {
                type: 'text',
                data: "ciao, questo è un messaggio temporizzato! {TIME} {NUM} {DATE}",
            },
            iterazioni: 2,
            periodo: 1000 * 5,
        }).expect(200);


    await request(baseUrl)
        .post("/api/temporizzati")
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
            channel: channel,
            content: {
                type: 'wikipedia',
                data: "randomuseless text",
            },
            iterazioni: 3,
            periodo: 1000 * 2,
        }).expect(200);

    await request(baseUrl)
        .post("/api/temporizzati")
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
            channel: channel,
            content: {
                type: 'image',
                data: "uselesss",
            },
            iterazioni: 10,
            periodo: 1000 * 60 * 3,
        }).expect(200);
}

async function createRolesAndClients(loginTokens: LoginToken[]) {
    assert(loginTokens.length > 1, "No login tokens")

    const smmToken = loginTokens[0] as LoginToken;
    const clientToken = loginTokens[1] as LoginToken;

    await request(baseUrl)
        .post("/api/user/role")
        .set('Authorization', `Bearer ${smmToken.token}`)
        .send({
            role: "smm",
        }).expect(200);


    await request(baseUrl)
        .post("/api/user/role")
        .set('Authorization', `Bearer ${clientToken.token}`)
        .send({
            role: "vip",
        }).expect(200);

    console.log("SMM and VIP role created")

    await request(baseUrl)
        .post(`/api/smm/add-client/${clientToken.name}`)
        .set('Authorization', `Bearer ${smmToken.token}`)
        .expect(200);

    console.log("Client added")
}

async function createPrivateMessage() {
    for (let from of allUsers) {
        for (let to of allUsers) {
            if (from === to) continue;
            const message = {
                channel: `@${to}`,
                content: {
                    type: 'text',
                    data: `Ciao ${to}, sono ${from}`,
                },
            };
            const token = loginTockenMap.get(from);
            if (!token) continue;

            await request(baseUrl)
                .post(messageCreateRoute)
                .set('Authorization', `Bearer ${token}`)
                .field('data', JSON.stringify(message)).expect(200);
        }
    }
}

function setChannelMember(listOfToken: string[]) {
    // @ts-ignore
    publicChannel[0].members = [listOfToken[0], listOfToken[1]];
    // @ts-ignore
    publicChannel[1].members = [listOfToken[0], listOfToken[1], listOfToken[2]];
    // @ts-ignore

    privateChannel[0].members = [listOfToken[0], listOfToken[1]];
    // @ts-ignore
    privateChannel[1].members = [listOfToken[0], listOfToken[1], listOfToken[2]];
}

async function createPrivateChannel() {
    for (let channel of privateChannel) {
        const channelInfo = {
            channelName: channel.nome,
            type: ChannelType.PRIVATE,
            description: channel.description,
        } as ChannelInfo
        if (channel.members[0] !== undefined) {
            await createChannel(channel.members[0], channelInfo);
        }
    }
}

async function addUsersToPrivateChannel() {
    for (let channel of privateChannel) {
        for (let token of channel.members) {
            if (token === channel.members[0]) continue;
            const tokenToUser = new Map();
            loginTockenMap.forEach((value, key) => tokenToUser.set(value, key));
            const user = tokenToUser.get(token);
            if (!token) continue;
            request(baseUrl).post(`/api/channel/${channel.nome}/add-owner`)
                .set('Authorization', `Bearer ${token}`).send({
                    toUser: user, permission: PermissionType.READWRITE

                }).expect(200);
        }
    }
}

async function creatModerator() {
    const token = (await request(baseUrl)
        .post(createUserRoute)
        .send(createCredentials('squealer'))
        .expect(201)).body.token;
    await request(baseUrl)
        .post("/api/user/role")
        .set('Authorization', `Bearer ${token}`)
        .send({
            role: "moderator",
        }).expect(200);
}

initConnection().then(async () => {
    await mongoose.connection.db.dropDatabase() // tanto nessuna informazione importante è presente, è sicuro droppare così
    console.log("Database dropped")
    mongoose.connection.close()

    await createDefaultUsers();
    await creatModerator();
    const loginToken = await getLoginTokens();

    const listOfToken = loginToken.map((token) => token.token);

    loginToken.forEach((token) => loginTockenMap.set(token.name, token.token));

    setChannelMember(listOfToken);

    await createChannels(listOfToken);
    console.log("Channels created")

    await joinChannel();
    console.log("Users joined channels")

    await createPrivateChannel();
    console.log("Private channels created")

    await addUsersToPrivateChannel();

    const message = await createMessagesPublic();
    console.log("Messages created")

    await createPrivateMessage();
    console.log('Private messages created')

    await createRensponse(message, listOfToken);

    await createGeolocationMessagesPublic();
    await createTemporalMessage();
    await createRolesAndClients(loginToken);
})
