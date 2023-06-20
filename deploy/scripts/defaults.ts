
import request from 'supertest';
import { baseUrl, createUserRoute, apiRoleRoute, channelCreateRoute, Credentials, messageCreateRoute } from './globals';
import { ChannelInfo, ChannelType } from '@model/channel';
import assert from 'node:assert'
import { randomTwits } from './readscript';
import { MessageCreation } from '@model/message';
import {DEFAULT_QUOTA} from '@config/api'

// the format is Name, Password,
// Note: the name != username!!! username is always lowercase
const proAccounts: [string, string][] = [
    ["fvPro", "12345678"],
    ['nomebuffo1', '12345678'],
    ['nomebuffo2', '12345678'],
];

const smmAccounts: [string, string][] = [
    ['fvSMM', '12345678'],
];

const modAccounts: [string, string][] = [
    ['fvMod', '12345678'],
];

const normalAccounts: [string, string][] = [
    ['fv', '12345678'],
    ['nomebuffo3', 'test'],
    ['nomebuffo4', 'test'],
    ['nomebuffo5', 'test'],
]

const users: Map<string, string> = new Map([
    ...normalAccounts,
    ...modAccounts,
    ...smmAccounts,
    ...proAccounts,
]);

const joinedChannels: Map<string, string[]> = new Map();

let loginTokens: Map<string, string> = new Map();

async function createUsers() {
    const logins: [string, string][] = await Promise.all(
        Array.from(users.entries()).map(async ([username, password]) => {
            const res = await request(baseUrl)
                .post(createUserRoute)
                .send({
                    username,
                    password,
                } as Credentials).expect(201)
            return [username, res.body.token];
        }
        )
    );

    loginTokens = new Map(logins);

    // roles:
    const changeRoles: [[string, string][], string][] = [
        [smmAccounts, 'smm'],
        [modAccounts, 'moderator'],
        [proAccounts, 'vip'],
    ]
    
    changeRoles.forEach(async ([accounts, role]) => {
        await Promise.all(
            accounts.map(async ([username, _]) => {
                await request(baseUrl)
                    .post(apiRoleRoute)
                    .set('Authorization', `Bearer ${loginTokens.get(username)}`)
                    .send({
                        role,
                    }).expect(200)
            }));
            console.log(`setting all ${role} roles`)
        });
}

// END USER CREATION

// Create default channels

const squealerChannels = [
    "NEWS",
    "EMERGENCY",
    "CONTROVERSIAL",
    "RANDOM"
]

const publicNormalChannels = [
    "rai_tv",
    "mediaset_tv",
    "unibo",
    "unimore",
    "amongus",
    "league_of_legends",
    "hexanaut",
    "valorant",
    "csgo",
]

const privateNormalChannels = [
    "casamiaportamivia",
    "casa_tua",
    "albero_rosso",
    "casa_mia",
]

const hashTagChannels = [
    "calcio",
    "basket",
    "tennis",
]

const channels = [
    ...squealerChannels,
    ...publicNormalChannels,
    ...privateNormalChannels,
    ...hashTagChannels,
]

const getChannelType = (channelName: string) => {
    if (squealerChannels.includes(channelName)) {
        return ChannelType.SQUEALER;
    } else if (publicNormalChannels.includes(channelName)) {
        return ChannelType.PUBLIC;
    } else if (privateNormalChannels.includes(channelName)) {
        return ChannelType.PRIVATE;
    } else if (hashTagChannels.includes(channelName)) {
        return ChannelType.HASHTAG;
    } else {
        throw new Error(`Channel ${channelName} not found`);
    }
}

const getUserFromChannel = (channelName: string): string => {
    if (squealerChannels.includes(channelName)) {
        return 'fvMod';
    } else {
        // return a random choice from users
        return Array.from(users.keys())[Math.floor(Math.random() * users.size)] as string;
    }
}

async function createChannels() {
    const res = await Promise.all(
        channels.map(async (channel) => {
            const channelType = getChannelType(channel);
        return request(baseUrl)
            .post(channelCreateRoute)
            .set('Authorization', `Bearer ${loginTokens.get(getUserFromChannel(channel))}`)
            .send({
                channelName: channel,
                type: channelType,
            } as ChannelInfo)
        }));

    res.forEach(r => {
        if (r.status !== 201) console.log(r.error);
        assert(r.status === 201)
    })
    console.log("created all channels");

    setTimeout(async () => {

        loginTokens.forEach(async (token, username) => {
            // randoom shuffle public channels
            // join 3 random public channels;
            const publicChannels = publicNormalChannels.sort(() => Math.random() - 0.5).slice(0, 3);
            joinedChannels.set(username, publicChannels);
            const res = await Promise.all(
                publicChannels.map(async (channelName) => {
                    return request(baseUrl)
                        .post(`/api/channel/${channelName}/join`)
                        .set('Authorization', `Bearer ${token}`)
                })
            )

            res.forEach(r => {
                if (r.status !== 200) console.log(r.error);
                assert(r.status === 200)
            })

            // save joined channels into map
        });
        console.log("joined all channels");
    }, 100);  // ancora non capisco perché c'è problema di concorrenza...

    setTimeout(async () => {
        // dai messaggi per ogni utente che ha joinato qualche canale pubblico:
        joinedChannels.forEach(async (channel, username) => {
            const quasiEsaurito = ["fvPro", "nomebuffo1", "nomebuffo2"].includes(username);
            const twits = [];

            if (quasiEsaurito) {
                let currentMaxQuota = DEFAULT_QUOTA.day;
                while (currentMaxQuota > 50) {
                    const randomTwit = randomTwits();
                    twits.push(randomTwit);
                    currentMaxQuota -= randomTwit.length;
                }
            } else {
                for (let i = 0; i < 5; i++) {
                    twits.push(randomTwits());
                }
            }

            const allRequests = [];
            for (let i = 0; i < twits.length; i++) {
                // select random channel
                const channelName = channel[Math.floor(Math.random() * channel.length)] as string;
                const message = {
                    channel: channelName,
                    content: {
                        type: "text",
                        data: twits[i],
                    },
                    parent: undefined,
                } as MessageCreation

                allRequests.push(
                    request(baseUrl)
                    .post(messageCreateRoute)
                    .set('Authorization', `Bearer ${loginTokens.get(username)}`)
                    .field('data', JSON.stringify(message))
                )
            }

            const res = await Promise.all(allRequests);
            res.forEach(r => {
                if (r.status !== 200) console.log(r.error);
                assert(r.status === 200)
            });
        });
    }, 1000);

    // TODO: mettere le reazioni random
    // TODO: fare in modo che nomebuffo1 stia per aumentare la quota per buona reputazione
    // TODO: fare in modo che nomebuffo2 stia per diminuire la quota per cattiva reputazione
}

export async function createDefaultUsersAndChannels() {
    await createUsers();

    // c'è un problema di concorrenza con mongo, questo è un hack per aspettare
    // che mongo abbia correttamente cambiato i ruoli e creato gli utenti
    setTimeout(async () => {
        await createChannels();
    }, 600);
}
