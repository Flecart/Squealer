import '../scss/App.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { MakeFeed } from '../components/Post';
import { Header } from '../components/Header';
import AddPost from '../components/AddPost';
import { SideBar } from '../components/SideBar';

export default function App(): JSX.Element {
    return (
        <Row>
            <Col lg={3}>
                <Container className="d-none d-lg-block">
                    <SideBar />
                </Container>
            </Col>
            <Col lg={6} className="border-start border-end border-light">
                <Header />
                <MakeFeed />
                <AddPost />
            </Col>
        </Row>
    );
}
