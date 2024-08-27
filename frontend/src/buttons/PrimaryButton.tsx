import {JSX} from "react";
import './PrimaryButton.css';

export interface PrimaryButtonProps {
    fn?: () => void;
    text: string
    className?: string;
    id?: string;
}

function PrimaryButton(props: PrimaryButtonProps): JSX.Element {
    const className = props.className || 'primary-button';
    const id = props.id || '';
    const fn = props.fn || (() => {});
    return (
        <button id={id} className={className} onClick={fn}>
            {props.text}
        </button>
    );
}

export default PrimaryButton;