import { type IMessage } from '@model/message';
import { Row, Col, Container, Image } from 'react-bootstrap';

interface PostProps {
    message: IMessage;
}

function Post({ message }: PostProps): JSX.Element {
    const profiloUrl = '/user/1';

    return (
        <Row className="g-4" as="article" role="article">
            <Col xs={2} md={1.5} xl={1} className="pe-0 flex-row-reverse">
                <Image
                    className="w-100 float-end"
                    src="https://picsum.photos/100/100?1"
                    alt="profile image"
                    style={{ minWidth: '3rem', maxWidth: '5rem' }}
                    roundedCircle
                />
            </Col>
            <Col>
                <Container className="d-flex justify-content-center flex-column pb-4">
                    <Row>
                        <div>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <span className="fs-4 fw-bolder"> Mario rossi </span>
                            </a>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <span className="fw-light"> @mario </span>
                            </a>
                            <span className="fw-light"> {message.date.toString()} </span>{' '}
                            {/* TODO: transform in user good date. (like 1h or similiar */}
                        </div>
                    </Row>
                    <Row>
                        <p>
                            {message.content.data}{' '}
                            {/* TODO: mostrare in modo differente a seconda del tipo, esempio imamgine o simile, questo sta ancora un altro compontent */}
                        </p>
                    </Row>
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
