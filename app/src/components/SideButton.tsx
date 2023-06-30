import type { Icon } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import 'src/scss/SideButton.scss';

interface SideButtonProps {
    to: string;
    name: string;
    SideIcon: Icon;
    isExternal?: boolean;
}

export function SideButton({ to, name, SideIcon, isExternal }: SideButtonProps): JSX.Element {
    if (isExternal !== undefined && isExternal)
        return (
            <button
                aria-label={name}
                className="btn btn-lg rounded-pill sideButton d-flex d-row align-items-center justify-content-evenly"
                onClick={() => (window.location.href = to)}
            >
                <SideIcon aria-hidden={true} className="pe-2" height={25} width={30} />
                {name}
            </button>
        );
    return (
        <Link
            to={to}
            aria-label={name}
            className="btn btn-lg rounded-pill sideButton d-flex d-row align-items-center justify-content-evenly"
        >
            <SideIcon aria-hidden={true} className="pe-2" height={25} width={30} />
            {name}
        </Link>
    );
}
