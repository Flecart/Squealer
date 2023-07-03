import { Accordion, Container, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import ChangeName from 'src/components/ChangeName';
import ChangePassword from 'src/components/ChangePassword';
import ChangeRole from 'src/components/ChangeRole';
import DeleteAccount from 'src/components/Delete';
import EnableReset from 'src/components/EnableReset';

export default function Settings(): JSX.Element {
    const [authState] = useContext(AuthContext);
    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center">
                {authState !== null ? (
                    <Stack className="d-flex rounded  p-2">
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Change Username</Accordion.Header>
                                <Accordion.Body>
                                    <ChangeName />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Change Password</Accordion.Header>
                                <Accordion.Body>
                                    <ChangePassword />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="4">
                                <Accordion.Header>Reset Password</Accordion.Header>
                                <Accordion.Body>
                                    <EnableReset />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Change Roles</Accordion.Header>
                                <Accordion.Body>
                                    <ChangeRole />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>Delete Account</Accordion.Header>
                                <Accordion.Body>
                                    <DeleteAccount />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Stack>
                ) : (
                    // TODO:???????
                    <Container>Cose Da Aggiungere</Container>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}
