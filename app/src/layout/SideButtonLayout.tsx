import type { Icon } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import 'src/scss/SideButton.scss';

interface SideButtonProps {
    to: string;
    name: string;
    SideIcon: Icon;
}

export function SideButton({ to, name, SideIcon }: SideButtonProps): JSX.Element {
    return (
        <Link
            to={to}
            aria-label={name}
            className="btn btn-lg rounded-pill sideButton d-flex d-row align-items-center justify-content-evenly"
        >
            <SideIcon className="pe-2" height={25} width={30} />
            {name}
        </Link>
    );
}
