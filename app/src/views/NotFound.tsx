import { Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function NotFound(): JSX.Element {
    const { message } = useParams<{ message: string }>();
    return (
        <SidebarSearchLayout>
            <div className="d-flex justify-content-center align-items-center flex-column">
                <h1>404</h1>
                <p className="ms-2">Page not found</p>
                {message !== undefined && (
                    <Alert variant="danger" className="mt-3">
                        {message}
                    </Alert>
                )}
            </div>
        </SidebarSearchLayout>
    );
}
