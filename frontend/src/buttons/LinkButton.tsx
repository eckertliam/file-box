import {JSX} from "react";
import PrimaryButton from "./PrimaryButton.tsx";
import {Link} from "react-router-dom";


interface LinkButtonProps {
    text: string;
    to: string;
}

function LinkButton(props: LinkButtonProps): JSX.Element {
    return (
        <Link to={props.to}>
            <PrimaryButton text={props.text}/>
        </Link>
    );
}

export default LinkButton;