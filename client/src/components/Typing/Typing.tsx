import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"

import classes from "./Typing.module.css";

interface ArticleSegment {
    type: `header${number}` | "text",
    body: string
}

interface Article {
    title: string,
    segments: ArticleSegment[]
}

const Typing: React.FC = () => {
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [textToType, setTextToType] = useState<Article>({
        title: "Loading...",
        segments: []
    });
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const location = useLocation();

    useEffect(() => {
        const fetchText = async () => {
            if (location.pathname === "/" || hasFetched) {
                return;
            }

            setHasFetched(true);

            try {
                const apiUrl = `http://localhost:3000${location.pathname}`;
                const response = await axios.get<Article>(apiUrl);
                setTextToType(response.data);
            } catch (error) {
                console.error("Error fetching Article:", error);
                setTextToType({
                    title: "Error fetching Article",
                    segments: []
                });

            }
        };

        fetchText();
    }, [location.pathname]); // re-fetch when URL changes

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    }

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

                {textToType.title.split("").map((letter, index) => (
                    <span key={index}
                        className={`${getTypingClass(letter, index)}`}>
                        {letter}
                    </span>
                ))}

            </div>

        </>
    )
};

export default Typing;
