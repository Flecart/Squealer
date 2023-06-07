import { Alert, Button, Container, Form, FormGroup, Modal, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { quotaPriceDay, quotaPriceMonth, quotaPriceWeek } from '@model/quota';
import { apiQuotaBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import { fetchApi } from '../api/fetch';

interface PurchaseQuotaProps {
    show: boolean;
    refresh: () => void;
    onHide: () => void;
}

const zeroSet = (value: number): number => {
    if (isNaN(value)) {
        return 0;
    } else {
        return value;
    }
};

export default function PurchaseQuota({ show, refresh, onHide }: PurchaseQuotaProps): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [dailyQuota, setDailyQuota] = useState<number>(0);
    const [weeklyQuota, setWeeklyQuota] = useState<number>(0);
    const [monthlyQuota, setMonthlyQuota] = useState<number>(0);
    const [price, setPrice] = useState('0');

    const [pendingRequest, setPendingRequest] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let sPrice: number = 0;
        sPrice += zeroSet(dailyQuota) * quotaPriceDay;
        sPrice += zeroSet(weeklyQuota) * quotaPriceWeek;
        sPrice += zeroSet(monthlyQuota) * quotaPriceMonth;
        setPrice(sPrice.toFixed(2));
    }, [dailyQuota, weeklyQuota, monthlyQuota]);

    const handlePurchaseQuota = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setDailyQuota(0);
            setWeeklyQuota(0);
            setMonthlyQuota(0);

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<null>(
                    `${apiQuotaBase}/buy`,
                    {
                        method: 'PUT',
                        body: JSON.stringify({
                            dailyQuote: dailyQuota,
                            weeklyQuote: weeklyQuota,
                            monthlyQuote: monthlyQuota,
                        }),
                    },
                    authState,
                    () => {
                        setSuccessMessage('Acquisto Avvenuto con Successo');
                        setInterval(() => {
                            refresh();
                        }, 1000);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [dailyQuota, weeklyQuota, monthlyQuota],
    );

    return (
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Acquisto Quota</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {successMessage !== null ? (
                    <>
                        <Alert variant="success">{successMessage}</Alert>
                    </>
                ) : (
                    <>
                        <Form className="m-0 me-4 py-3 px-3 border" onSubmit={handlePurchaseQuota}>
                            <FormGroup className="mb-3">
                                <Form.Label className="text-light">Quota Giornaliera</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={dailyQuota}
                                    min={0}
                                    onChange={(e) => {
                                        setDailyQuota(parseInt(e.target.value));
                                    }}
                                    placeholder="0"
                                />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <Form.Label className="text-light">Quota Settimanale</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={weeklyQuota}
                                    min={0}
                                    onChange={(e) => {
                                        setWeeklyQuota(parseInt(e.target.value));
                                    }}
                                    placeholder="0"
                                />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <Form.Label className="text-light">Quota Mensile</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={monthlyQuota}
                                    min={0}
                                    onChange={(e) => {
                                        setMonthlyQuota(parseInt(e.target.value));
                                    }}
                                    placeholder="0"
                                />
                            </FormGroup>
                            <p> Prezzo Totale {price} &euro; </p>
                            <Container className="d-flex justify-content-center">
                                <Button className="col-6 me-1" variant="warning" type="submit">
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
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
