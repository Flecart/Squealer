import { Toast, ToastContainer } from 'react-bootstrap';
import { LogoLight } from 'app/logos/LogosInfo';

interface DebtWarningProps {
    show: boolean;
    onClose: () => void;
}

export default function DebtWarning({ show, onClose }: DebtWarningProps): JSX.Element {
    return (
        <ToastContainer
            aria-atomic="true"
            role="alert"
            aria-live="assertive"
            position="middle-center"
            style={{ zIndex: 1 }}
        >
            <Toast show={show} onClose={onClose} aria-atomic="true" role="alert" aria-live="assertive">
                <Toast.Header>
                    <img src={LogoLight} className="rounded me-2" aria-hidden={true} height={30} width={30} />
                    <strong className="me-auto text-light">Squealer Warning</strong>
                </Toast.Header>
                <Toast.Body>
                    Attenzione, in questo momento potresti star utilizzando della quota extra.
                    <br />
                    In questo caso, dopo aver pubblicato il post, dovrai pagare la quota extra utilizzata prima di
                    pubblicarne un altro.
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}
