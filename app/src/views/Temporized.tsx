import { type ITemporizzati } from '@model/temporizzati';
import { useContext, useEffect, useState } from 'react';
import { Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiTemporized } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

interface TemporizedState {
    loading: boolean;
    error: string | null;
    data: ITemporizzati[];
}

export default function Temporized(): JSX.Element {
    const [auth] = useContext(AuthContext);
    const [state, setState] = useState<TemporizedState>({
        loading: true,
        error: null,
        data: [],
    });

    useEffect(() => {
        fetchApi<ITemporizzati[]>(
            apiTemporized,
            { method: 'GET' },
            auth,
            (a) => {
                setState({ ...state, data: a, loading: false });
            },
            (e) => {
                setState({ ...state, error: e.message, loading: false });
            },
        );
    }, []);
    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row>
                    <h2>Temporizzati</h2>
                </Row>
                <Row>
                    <ListGroup>
                        {state.data.map((temporized, i) => (
                            <ListGroupItem key={i}>{JSON.stringify(temporized)}</ListGroupItem>
                        ))}
                    </ListGroup>
                </Row>
            </Container>
        </SidebarSearchLayout>
    );
}
