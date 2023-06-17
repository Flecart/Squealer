import { Navbar } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from 'src/contexts';
import { SideButton } from 'src/components/posts/SideButton';
import * as Icon from 'react-bootstrap-icons';

export function SideBar(): JSX.Element {
    const [authState] = useContext(AuthContext);

    return (
        <Navbar className="d-flex flex-column align-items-start align-content-evenly" sticky="top">
            <SideButton to="/" name="Home" SideIcon={Icon.HouseFill} />

            {authState !== null ? (
                <>
                    <SideButton to="/settings" name="Impostazioni" SideIcon={Icon.GearFill} />

                    <SideButton to="/logout" name="Logout" SideIcon={Icon.BoxArrowLeft} />

                    <SideButton to={`/user/${authState.username}`} name="Profilo" SideIcon={Icon.PersonFill} />

                    <SideButton to="/addpost" name="Nuovo Post" SideIcon={Icon.PencilSquare} />

                    <SideButton to="/channels" name="Esplora Canali" SideIcon={Icon.People} />
                </>
            ) : (
                <>
                    <SideButton to="/login" name="Login" SideIcon={Icon.BoxArrowInLeft} />

                    <SideButton to="/create" name="Registrati" SideIcon={Icon.FileTextFill} />

                    <SideButton to="/recover" name="Reset" SideIcon={Icon.ShieldLockFill} />
                </>
            )}
        </Navbar>
    );
}
