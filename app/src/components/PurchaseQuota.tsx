/* import {Alert, Button, Container, Form, FormGroup, Spinner} from "react-bootstrap"
import React, { useCallback, useContext, useState } from 'react';
import { apiQuotaBase } from "src/api/routes";
import { AuthContext } from 'src/contexts';

import { fetchApi } from '../api/fetch';

export default function PurchaseQuota(): JSX.Element {

    const [authState] = useContext(AuthContext);

    const [dailyQuota, setDailyQuota] = useState(0);

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handlePurchaseQuota = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setDailyQuota(0);

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<null>(
                    `${apiQuotaBase}/buy`,
                    {
                        method: 'PUT',
                        body: JSON.stringify({
                            dailyQuote: dailyQuota, 
                            weeklyQuote: dailyQuota, 
                            monthlyQuote: dailyQuota
                        }),
                    },
                    authState,
                    () => {
                        // navigate(`/user/${newUsername}`);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [dailyQuota],
    );


    return(
        <Form className="m-0 me-4 py-3 px-3 border" onSubmit={handlePurchaseQuota}>
            <FormGroup className="mb-3">
                <Form.Label className="text-light">Quota Giornaliera</Form.Label>
                <Form.Control
                    type="number"
                    value={dailyQuota}
                    onChange={(e) => {
                        setDailyQuota(parseInt(e.target.value));
                    }}
                    placeholder="0"
                />
            </FormGroup>
            <Container className="d-flex justify-content-center">
                <Button className="col-6 me-1" variant="outline-warning" type="submit">
                    Acquista
                </Button>
            </Container>
            <Container className="d-flex justify-content-center">
                {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                {pendingRequest && (
                    <>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </>
                )}
            </Container>
        </Form>
    )
}

 */
