import { TimerResult, useTimer } from 'react-timer-hook';
import { IUser, haveEnoughtQuota } from '@model/user';
import { type MessageCreation, type MessageCreationRensponse } from '@model/message';
import { fetchApi } from 'src/api/fetch';
import { AuthResponse } from '@model/auth';
import { apiMessageBase } from 'src/api/routes';

export default (
    user: IUser,
    messageText: string,
    destination: string,
    authState: AuthResponse,
    sec: number,
): TimerResult => {
    const time: Date = new Date();
    time.setSeconds(time.getSeconds() + sec);

    const postTemporize = (): void => {
        //const [error, setError] = useState<string | null>(null);
        if (user !== null && !haveEnoughtQuota(user, messageText.length)) {
            //setError(() => 'Not enought quota');
            return;
        }

        let channel = destination;
        let parent = undefined;

        const message: MessageCreation = {
            content: {
                data: messageText,
                type: 'text',
            },
            channel,
            parent,
        };
        fetchApi<MessageCreationRensponse>(
            `${apiMessageBase}/`,
            {
                method: 'POST',
                body: JSON.stringify(message),
            },
            authState,
            () => {
                //navigate(`/message/${message.id}`);
            },
            () => {
                //setError(() => error.message);
            },
        );
    };

    const Timer = useTimer({ expiryTimestamp: time, onExpire: postTemporize, autoStart: true });

    return Timer;
};
