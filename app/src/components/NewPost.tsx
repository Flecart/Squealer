import { Row, Col, Container, Image } from 'react-bootstrap';
import '../scss/Posts.scss';

function Post(): JSX.Element {
    const profiloUrl = '/user/1';

    return (
        <Row className="g-4" as="article" role="article">
            <Col xs={2} md={1.5} xl={1} className="pe-0 flex-row-reverse">
                <Image
                    className="w-100 min-max-img float-end"
                    src="https://picsum.photos/100/100?1"
                    alt="profile image"
                    roundedCircle
                />
            </Col>
            <Col>
                <Container className="d-flex justify-content-center flex-column pb-4">
                    <Row>
                        <div>
                            <a href={profiloUrl} className="text-decoration-none link-dark">
                                <span className="fs-4 fw-bolder"> Mario rossi </span>
                            </a>

                            <a href={profiloUrl} className="text-decoration-none link-dark">
                                <span className="fw-light"> @mario </span>
                            </a>

                            <span className="fw-light"> - 1h </span>
                        </div>
                    </Row>
                    <Row>
                        <p>
                            {' '}
                            LLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                            cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id{' '}
                        </p>
                    </Row>
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
