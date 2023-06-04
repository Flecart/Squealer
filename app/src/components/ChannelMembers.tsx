import { type IChannel } from '@model/channel';
import { type IUser } from '@model/user';
import { useEffect, useState } from 'react';

interface PrompsChannelMembers {
    channel: IChannel;
}
export default function ChannelMembers({ channel }: PrompsChannelMembers): JSX.Element {
    return (
        <>
            {channel.users.map((user) => (
                <ChannelMember key={user.user} member={user.user} />
            ))}
        </>
    );
}

function ChannelMember({ member }: { member: string }): JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);
    useEffect(() => {
        fetchApi<IUser>(
            `${apiUserBase}/${member}`,
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (error) => {},
        );
    }, [member]);

    return <></>;
}
