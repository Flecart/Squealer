import { Alert, Button, Container } from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { useNavigate, Link } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Settings(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center">
                {authState !== null ? (
                    //reset password
                    //change password
                    <>
                        <Link to="/changepass"></Link>
                        <Link to="/reset"></Link>
                        <Link to="/delete">clicca qui per eliminare l'account</Link>
                    </>
                ) : (
                    <Container>Cose Da Aggiungere</Container>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}
