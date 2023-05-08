import UploadAndDisplayImage from 'src/components/UploadImage';
import { MakeFeed } from '../components/LoadFeed';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function App(): JSX.Element {
    return (
        <SidebarSearchLayout>
            <MakeFeed />
            <UploadAndDisplayImage />
        </SidebarSearchLayout>
    );
}
