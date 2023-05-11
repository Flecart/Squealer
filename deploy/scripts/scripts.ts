/* eslint-disable */
// This scripts initializes the server and starts listening for requests

import mongoose from 'mongoose';
import request from 'supertest';
import initConnection from '../../server/mongo';

import dotenv from 'dotenv';

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

async function createChannels(loginToken: string) {
    return request(baseUrl)
        .post(channelCreateRoute)
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
            channelName: 'test-channel',
            description: 'test-description',
        })
        .expect(201)
}

async function createMessages(loginTokens: string[]) {

    const message  = {
        channel: 'test-channel',
        content: {
            type: 'text',
            data: 'test-message',
        },
    }

    const promises = loginTokens.map((token) => {
        return request(baseUrl)
            .post(messageCreateRoute)
            .set('Authorization', `Bearer ${token}`)
            .field('data', JSON.stringify(message))
            .expect(200);
    });

    return await Promise.all(promises)
    console.log("Messages created")
}

initConnection().then(async () => {
    await mongoose.connection.db.dropDatabase() // tanto nessuna informazione importante è presente, è sicuro droppare così
    console.log("Database dropped")
    mongoose.connection.close()

    await createDefaultUsers();
    const loginToken = await getLoginTokens();
    await createChannels(loginToken[0] as string);
    console.log("Channels created")

    await createMessages(loginToken);
    console.log("Messages created")
})
