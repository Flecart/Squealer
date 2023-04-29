import { Container, Row, Tab, Tabs } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import Post from '../components/NewPost';
import { useDispatch, useSelector } from 'react-redux';
import * as userSelector from '@flux/selectors/user';
import { type IUser } from '../../../model/user';
import * as userAction from '@flux/actions/user';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function User(): JSX.Element {
    const { username } = useParams();

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userAction.fetchUser({ username: (username ?? '') }));
    }, [dispatch]);

    const handleTabChange = (key: string | null): void => {
        console.log(key);
    };

    const user: IUser | null = useSelector(userSelector.selectDisplayUser);
    return (
        <>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row className="py-3 m-auto">
                    <Image src={user?.profile_pic} alt="profile image" roundedCircle />
                </Row>
                <Row>
                    <h1 className="text-center"> {user?.profile_pic} </h1>
                </Row>
                <Row>
                    <h2 className="text-center"> {username} </h2>
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
                {/* TODO: edit profile button if the user is him self */}
            </Container>

            <Container as="main">
                {/* TODO: refactor tab element to have li childs as elements?? */}
                <Tabs
                    defaultActiveKey="hightlight" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                    onSelect={handleTabChange}
                    className="mb-3"
                >
                    {/* TODO: forse i tabs dovrebbero essere dei componenti? dovremmo dare chiave, elemento, poi anche funzione (che carichi le cose, quindi credo vera
                        mente che sarebbe meglio farlo componente separato) */}
                    <Tab eventKey="hightlight" title="Highlight">
                        <Post />
                        <Post />
                        <Post />
                        <Post />
                        <Post />
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
