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
                `${apiUserBase}/pay-debt`,
                {
                    method: 'PUT',
                },
                authState,
                () => {
                    setSuccessMessage('Successful Payment!');
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
                            Dear user {authState?.username},<br />
                            To continue using our service, <br />
                            is necessary pay the extra quota used in your previous post.
                            <br />
                            The amount do be paid is {debt * quotaPriceExtra} &euro;
                        </div>
                        <Button variant="danger" onClick={handlePayDebt}>
                            Proceed to Payment
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
