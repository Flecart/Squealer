import request from 'supertest';
import { baseUrl, createUserRoute, apiRoleRoute, 
    channelCreateRoute, Credentials, messageCreateRoute,
    addClientRoute,
    joinChannelRoute,
    addReactionRoute,
    checkAndReportStatus
 } from './globals';
import { ChannelInfo, ChannelType } from '@model/channel';
import assert from 'node:assert'
import { randomTwits } from './readscript';
import { IReactionType, MessageCreation, MessageCreationRensponse } from '@model/message';
import { DEFAULT_QUOTA } from '@config/api'
import { stringFormat } from "@app/utils"

// the format is Name, Password,
// Note: the name != username!!! username is always lowercase
const proAccounts: [string, string][] = [
    ["fvPro", "12345678"],
    ['nomebuffo1', '12345678'],
    ['nomebuffo2', '12345678'],
];

const smmAccounts: [string, string][] = [
    ['fvSMM', '12345678'],
    ['noclients', '12345678']
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
                } as Credentials)

            checkAndReportStatus(res, 201, `Error creating user ${username}`);
            return [username, res.body.token];
        }
        )
    );
    console.log("created all users");

    loginTokens = new Map(logins);

    // roles:
    const changeRoles: [[string, string][], string][] = [
        [smmAccounts, 'smm'],
        [modAccounts, 'moderator'],
        [proAccounts, 'vip'],
    ]

    let promise = changeRoles.map(async ([accounts, role]) => {
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

        if (role === 'smm') {
            // add clients to fvsmm
            const clients = proAccounts.map(([username, _]) => username);
            for (const client of clients) {
                console.log()
                const res = await request(baseUrl)
                    .post(stringFormat(addClientRoute, [client.toLocaleLowerCase()]))
                    .set('Authorization', `Bearer ${loginTokens.get('fvSMM')}`)
                    .send({
                        role,
                        client,
                    })
                
                checkAndReportStatus(res, 200, `Error adding client ${client.toLocaleLowerCase()} to fvSMM`);
            }
        }
    });
    await Promise.all(promise);
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

const allMessages: MessageCreationRensponse[] = [];

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

async function createChannelsJoinsMessages() {
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
        checkAndReportStatus(r, 201, `Error creating channel ${r.body.channelName}`);
    })
    console.log("created all channels");


    for (const [username, token] of loginTokens.entries()) {
        // randoom shuffle public channels
        // join 3 random public channels;
        const publicChannels = publicNormalChannels.sort(() => Math.random() - 0.5).slice(0, 3);
        joinedChannels.set(username, publicChannels);
        const res = await Promise.all(
            publicChannels.map(async (channelName) => {
                return request(baseUrl)
                    .post(stringFormat(joinChannelRoute, [channelName]))
                    .set('Authorization', `Bearer ${token}`)
            })
        )

        res.forEach(r => {
            if (r.status !== 200) console.log(r.error);
            assert(r.status === 200)
        })

        // save joined channels into map
    }
    console.log("joined all channels");


    for (const [username, channel] of joinedChannels.entries()) {
        const quasiEsaurito = ["fvPro", "nomebuffo1", "nomebuffo2"].includes(username);
        const twits = [];

        if (quasiEsaurito) {
            let currentMaxQuota = DEFAULT_QUOTA.day;
            while (currentMaxQuota > 0) {
                const randomTwit = randomTwits();
                twits.push(randomTwit);
                currentMaxQuota -= randomTwit.length;
            }
            twits.pop(); // l'ultimo elemento che ha fatto traboccare il vado è da togliere
        } else {
            for (let i = 0; i < 5; i++) {
                twits.push(randomTwits());
            }
        }

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

            // il messaggio deve essere awaitato, in modo che le quota si aggiornino correttamente.
            // non possiamo fare promise all.
            const res = await request(baseUrl)
                .post(messageCreateRoute)
                .set('Authorization', `Bearer ${loginTokens.get(username)}`)
                .field('data', JSON.stringify(message))

            if (res.status !== 200) console.log(res.error);
            assert(res.status === 200);
            allMessages.push(res.body as MessageCreationRensponse);
        }
    }
}

const createRandomReactionType = (): IReactionType => {
    let reactionType = IReactionType.UNSET;
    const random = Math.random();
    if (random < 0.25) {
        reactionType = IReactionType.LIKE;
    } else if (random < 0.5) {
        reactionType = IReactionType.DISLIKE;
    } else if (random < 0.75) {
        reactionType = IReactionType.LOVE;
    } else {
        reactionType = IReactionType.ANGRY;
    }

    return reactionType
}

export async function createMessageReactions() {
    loginTokens.forEach(async (token, _) => {
        // chose random number of reactions:
        const numberOfReactions = Math.floor(Math.random() * allMessages.length * 0.70);

        // chose random messages to react to
        const messagesToReact = allMessages.sort(() => Math.random() - 0.5).slice(0, numberOfReactions);

        const res = await Promise.all(
            messagesToReact.map(async (message) => {
                return request(baseUrl)
                    .post(stringFormat(addReactionRoute, [message.id]))
                    .set('Authorization', `Bearer ${token}`)
                    .send({ type: createRandomReactionType() });
            })
        )

        res.forEach(r => {
            if (r.status !== 200) console.log(r.error);
            assert(r.status === 200);
        });
    });

    console.log("created all reactions");

    // TODO: fare in modo che nomebuffo1 stia per aumentare la quota per buona reputazione
    // TODO: fare in modo che nomebuffo2 stia per diminuire la quota per cattiva reputazione
    // Questo può essere fatto in modo facile con i superpoteri di un account squealer.
}

export async function createDefaultUsersAndChannels() {
    await createUsers();

    await createChannelsJoinsMessages();

    await createMessageReactions();
}
