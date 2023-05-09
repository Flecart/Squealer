import { MakeFeed } from '../components/LoadFeed';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import Map from '../components/Map';
import { Container } from 'react-bootstrap';

export default function App(): JSX.Element {
    return (
        <SidebarSearchLayout>
            <MakeFeed />
            <Container>
                <Map lat={1} lng={2} />
            </Container>
        </SidebarSearchLayout>
    );
}
