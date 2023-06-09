import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Col } from 'react-bootstrap';
import 'src/scss/SidebarSearchLayout.scss';

interface Props {
    children: JSX.Element | JSX.Element[];
}

export default function SidebarSearchLayout({ children }: Props): JSX.Element {
    return (
        <div className="d-flex justify-content-center container" style={{ background: 'var(--bs-body-bg);' }}>
            <Col md={3} className="d-none d-md-block">
                <SideBar />
            </Col>
            <Col md={6} id="mainCol" className="container-fluid p-0">
                <Header />
                {children instanceof Array ? children.map((child) => child) : children}
            </Col>
            <Col md={3} className="d-none d-md-block"></Col>
        </div>
    );
}
