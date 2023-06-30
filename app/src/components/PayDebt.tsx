import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUserBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import { fetchApi } from '../api/fetch';
import { quotaPriceExtra } from '@model/quota';

interface PayDebtProps {
    show: boolean;
    onHide: () => void;
    debt: number;
}

export default function PayDebt({ show, onHide, debt }: PayDebtProps): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [pendingRequest, setPendingRequest] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    const handlePayDebt = (): void => {
        setErrorMessage(null);

        if (!pendingRequest) {
            if (authState == null) return;
            setPendingRequest(true);
            fetchApi<null>(
                apiUserPayDebt,
                {
                    method: 'PUT',
                },
                authState,
                () => {
                    setSuccessMessage('Pagamento Avvenuto con Successo');
                    setPendingRequest(false);
                    setInterval(() => {
                        navigate(0);
                    }, 1000);
                },
                (error) => {
                    setErrorMessage(() => error.message);
                    setPendingRequest(false);
                },
            );
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Pagamento Quota Extra</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {successMessage !== null ? (
                    <>
                        <Alert variant="success">{successMessage}</Alert>
                    </>
                ) : (
                    <div className="d-flex flex-column justify-content-center">
                        <div className="mb-2">
                            Gentile utente {authState?.username},<br />
                            Per continuare a utilizzare il nostro servizio, <br />
                            è necessario pagare la quota extra da lei usufruita nel precedente post.
                            <br />
                            L&apos;importo da pagare è di {debt * quotaPriceExtra} &euro;
                        </div>
                        <Button variant="danger" onClick={handlePayDebt}>
                            Procedi al Pagamento
                        </Button>
                    </div>
                )}
                {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                {pendingRequest && (
                    <>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
