import { MakeFeed } from '../components/Post';
import AddPost from '../components/AddPost';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function App(): JSX.Element {
    return (
        <SidebarSearchLayout>
            <>
                <MakeFeed />
                <AddPost />
            </>
        </SidebarSearchLayout>
    );
}
