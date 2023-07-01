import { ChannelType, type ChannelInfo, type ChannelResponse } from '@model/channel';
import { useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { apiChannelCreate } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { AuthContext } from '../contexts';

export function CreateChannel(): JSX.Element {
    const [auth] = useContext(AuthContext);
    const [channelName, setChannelName] = useState<string>('');
    const [channelDescription, setChannelDescription] = useState<string>('');
    const [channelType, setChannelType] = useState<ChannelType>(ChannelType.PUBLIC);

    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const createChannel = (): void => {
        if (channelName === '') {
            setError('Channel name cannot be empty');
            return;
        }
        setPending(true);
        const channelInfo: ChannelInfo = {
            channelName,
            description: channelDescription,
            type: channelType,
        };

        fetchApi<ChannelResponse>(
            apiChannelCreate,
            {
                method: 'POST',
                body: JSON.stringify(channelInfo),
            },
            auth,
            (data) => {
                setPending(false);
                navigate(`/channel/${data.channel}`);
            },
            (err) => {
                setError(err.message);
                setPending(false);
            },
        );
    };

    const type = [ChannelType.PUBLIC, ChannelType.PRIVATE];

    const navigate = useNavigate();

    if (auth === null) {
        navigate('/login');
    }
    return (
        <SidebarSearchLayout>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Channel Name</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={(e) => {
                            setChannelName(e.target.value);
                        }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={(e) => {
                            setChannelDescription(e.target.value);
                        }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                    <Form.Label>Channel Type</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            setChannelType(e.target.value);
                        }}
                    >
                        {type.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                    <Button variant="primary" onClick={createChannel} disabled={pending}>
                        Create
                    </Button>
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                    <Alert variant="danger" show={error !== ''}>
                        {error}
                    </Alert>
                </Form.Group>
            </Form>
        </SidebarSearchLayout>
    );
}
