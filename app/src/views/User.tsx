import { Container, Row, Tab, Tabs } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';

function User(): JSX.Element {
    // const { _username } = useParams();

    const handleTabChange = (key: string | null): void => {
        console.log(key);
    };

    return (
        <>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row className="py-3 m-auto">
                    <Image src="https://picsum.photos/150/150" alt="profile image" roundedCircle />
                </Row>
                <Row>
                    <h1 className="text-center"> Mario rossi </h1>
                </Row>
                <Row>
                    <h2 className="text-center"> @mario </h2>
                </Row>
                <Row>
                    <p className="text-center"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                </Row>

                <Row>
                    <div className="d-flex justify-content-around">
                        <span>
                            {' '}
                            <b>1Mil</b> Followers{' '}
                        </span>
                        <span>
                            {' '}
                            <b>1Mil</b> Following{' '}
                        </span>
                    </div>
                </Row>
            </Container>

            <Container>
                {/* TODO: refactor tab element to have li childs as elements?? */}
                <Tabs
                    defaultActiveKey="hightlight" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                    id="uncontrolled-tab-example"
                    onSelect={handleTabChange}
                    className="mb-3"
                >
                    {/* TODO: forse i tabs dovrebbero essere dei componenti? dovremmo dare chiave, elemento, poi anche funzione (che carichi le cose, quindi credo vera
                        mente che sarebbe meglio farlo componente separato) */}
                    <Tab eventKey="hightlight" title="Highlight">
                        profile
                    </Tab>
                    <Tab eventKey="posts" title="Last Posts">
                        hello
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
}

export default User;
