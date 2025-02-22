import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"

import classes from "./Typing.module.css";

const Typing: React.FC = () => {
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const textToType: string =
        "This is a wiki article, you should read it, no, you should type it."

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    }

    const textArray: string[] = textToType.split("");

    function getTypingClass(letter: string, index: number) {
        const isLastIndex = index === userInput.length - 1;
        const isTypedCorrectly = userInput[index] === letter;

        if (index >= userInput.length) {
            return classes.to_type;
        }
        if (isLastIndex && userInput[index] !== letter) {
            return classes.typing_wrong;
        }
        if (isLastIndex && isTypedCorrectly) {
            return classes.typing;
        }
        if (isTypedCorrectly) {
            return classes.typed;
        }
        return classes.typed_wrong;
    }

    // auto focus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <>
            <div onClick={() => inputRef.current?.focus()}>

                {/* invisible input to capture keyboard press */}
                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="opacity-0 position-absolute"
                />

                {textArray.map((letter, index) => (
                    <span className={`${getTypingClass(letter, index)}`}>
                        {letter}
                    </span>
                ))}

            </div>

        </>
    )
};

export default Typing;
