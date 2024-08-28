import React, {JSX} from "react";
import './Heading.css';

interface HeadingProps {
    text: string;
}

function Heading(props: HeadingProps): JSX.Element {
    return (
        <div className='heading'>
            <h1>{props.text}</h1>
        </div>
    );
}

export default Heading;