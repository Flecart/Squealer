import { LoginService } from '@api/login/loginService';
import MessageModel from '@db/message';
import ChannelModel from '@db/channel';
import UserModel from '@db/user';
import { ChannelType, PermissionType } from '@model/channel';
import { default as logger } from './logger';
import { IMessage, MessageCreation, messageSort } from '@model/message';
import { TemporizzatiService } from '@api/temporizzati/temporizzatiService';
import { MessageService } from '@api/messages/messageService';

enum Channels {
    NEWS = 'NEWS',
    EMERGENCY = 'EMERGENCY',
    RANDOMWIKI = 'RANDOMWIKI',
    CONTROVERSIAL = 'CONTROVERSIAL',
    RANDOMIMG = 'RANDOMIMG',
}

const squealerChannels = [
    Channels.NEWS,
    Channels.EMERGENCY,
    Channels.CONTROVERSIAL,
    Channels.RANDOMWIKI,
    Channels.RANDOMIMG,
];

const mapChannelToContent = new Map<Channels, (channel: string) => Promise<MessageCreation | null>>([
    [Channels.CONTROVERSIAL, controversialMessageCreation],
    [Channels.RANDOMWIKI, wikipediaMessageCreation],
    [Channels.RANDOMIMG, randomImageMessageCreation],
]);

const mapChannelToNextMessage = new Map<Channels, () => number>([
    [Channels.CONTROVERSIAL, nextDay],
    [Channels.RANDOMWIKI, randomMaxHour],
    [Channels.RANDOMIMG, randomMaxHour],
]);

const squealerUser = 'squealer';

const loggerDefChannel = logger.child({ label: 'squealerDefault' });

export async function startDefault(): Promise<void> {
    await addDefaultUser();
    await checkDefaultChannels();
    startDefaultMessages();
}

async function checkDefaultChannels(): Promise<void> {
    for (const channel of squealerChannels) {
        const channelRes = await ChannelModel.findOne({ name: channel });
        if (channelRes === null) {
            ChannelModel.create({
                name: channel,
                description: '',
                messages: [],
                type: ChannelType.SQUEALER,
                users: [{ notification: false, user: squealerUser, privilege: PermissionType.ADMIN }],
            });
        }
    }
    loggerDefChannel.info('Default channels created');
}

async function addDefaultUser() {
    let user = await UserModel.findOne({ username: squealerUser });
    if (user === null) {
        await new LoginService().createUser(squealerUser, squealerUser);
        user = await UserModel.findOne({ username: squealerUser });
    }
    if (user === null) {
        loggerDefChannel.error('Default user not created');
    } else {
        loggerDefChannel.info('Default user created');
        user.maxQuota.day = Number.MAX_SAFE_INTEGER;
        user.maxQuota.month = Number.MAX_SAFE_INTEGER;
        user.maxQuota.week = Number.MAX_SAFE_INTEGER;
        user.markModified('maxQuota');
        await user.save();
        loggerDefChannel.info('Default user quota set to max');
    }
}

function startDefaultMessages() {
    for (const channel of squealerChannels) {
        const nextMessage = mapChannelToNextMessage.get(channel);
        if (nextMessage !== undefined) setTimeout(createMessage, nextMessage(), channel);
    }
}

async function createMessage(channel: Channels): Promise<void> {
    loggerDefChannel.info(`Creating message for ${channel}`);
    try {
        const nextMessage = mapChannelToNextMessage.get(channel);
        const content = mapChannelToContent.get(channel);
        if (content === undefined) return;
        const message = await content(channel);
        if (message !== null) {
            await new MessageService().create(message, squealerUser);
        }
        if (nextMessage !== undefined) setTimeout(createMessage, nextMessage(), channel);
    } catch (err) {
        loggerDefChannel.error(err);
    }
}

async function randomImageMessageCreation(channel: string): Promise<MessageCreation | null> {
    const testo = await TemporizzatiService.getImageContent();
    return {
        parent: undefined,
        content: {
            data: testo,
            type: 'image',
        },
        channel: channel,
    };
}

async function wikipediaMessageCreation(channel: string): Promise<MessageCreation | null> {
    const testo = await TemporizzatiService.getWikipediaContent();
    return {
        parent: undefined,
        content: {
            data: testo,
            type: 'text',
        },
        channel: channel,
    };
}

function nextDay(): number {
    const hour = 60 * 60 * 1000;
    return 24 * hour;
}

function randomMaxHour(): number {
    const minute = 60;
    const second = 1000;
    return Math.floor(Math.random() * 60) * minute * second;
}

async function controversialMessageCreation(channel: string): Promise<MessageCreation | null> {
    const all = MessageModel.find({ date: { $gte: new Date(Date.now() - nextDay()) } });
    if (all === null) return null;
    const messages = await all;
    const risk = messages.sort((a: IMessage, b: IMessage) => messageSort(a, b, 'risk'))[0];
    if (risk === undefined) return null;
    return {
        parent: undefined,
        content: {
            data: `il messaggio più controverso delle ultime ore è /messages/${risk._id}`,
            type: 'text',
        },
        channel: channel,
    };
}
