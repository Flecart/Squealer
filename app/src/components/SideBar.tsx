import { Navbar } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { SideButton } from 'src/components/SideButton';
import * as Icon from 'react-bootstrap-icons';
import { fetchApi } from 'src/api/fetch';
import { UserRoles, type IUser } from '@model/user';
import { apiUser, squealerBaseUrl } from 'src/api/routes';
import { stringFormat } from 'src/utils';

export function SideBar(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const [role, setRole] = useState<UserRoles | null>(null);

    useEffect(() => {
        if (authState === null) return;
        fetchApi<IUser>(
            stringFormat(apiUser, [authState.username]),
            { method: 'GET' },
            authState,
            (user) => {
                setRole(() => user.role);
            },
            () => {},
        );
    }, [authState]);

    return (
        <Navbar role="menubar" className="d-flex flex-column align-items-start align-content-evenly" sticky="top">
            <SideButton to="/" name="Home" SideIcon={Icon.HouseFill} />

            {authState !== null ? (
                <>
                    <SideButton to="/search" name="Search" SideIcon={Icon.Search} />
                    <SideButton to="/settings" name="Settings" SideIcon={Icon.GearFill} />

                    <SideButton to="/logout" name="Logout" SideIcon={Icon.BoxArrowLeft} />

                    <SideButton to={`/user/${authState.username}`} name="Profile" SideIcon={Icon.PersonFill} />

                    <SideButton to="/addpost" name="New Post" SideIcon={Icon.PencilSquare} />

                    {role === UserRoles.SMM && (
                        <SideButton
                            to={`${squealerBaseUrl}/smm`}
                            name="To SMM App"
                            SideIcon={Icon.ClipboardData}
                            isExternal={true}
                        />
                    )}
                    {role === UserRoles.MODERATOR && (
                        <SideButton
                            to={`${squealerBaseUrl}/moddash`}
                            name="To Mod Dashboard"
                            SideIcon={Icon.ClipboardData}
                            isExternal={true}
                        />
                    )}
                </>
            ) : (
                <>
                    <SideButton to="/login" name="Login" SideIcon={Icon.BoxArrowInLeft} />

                    <SideButton to="/create" name="Register" SideIcon={Icon.FileTextFill} />

                    <SideButton to="/recover" name="Reset" SideIcon={Icon.ShieldLockFill} />
                </>
            )}
            <SideButton to="/channels" name="Explore Channels" SideIcon={Icon.People} />
        </Navbar>
    );
}
