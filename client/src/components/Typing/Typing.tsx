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
    const [userInput, setUserInput] = useState<string>("");
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0)
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [article, setArticle] = useState<Article>({
        title: "Loading...",
        segments: []
    });
    const location = useLocation();

    useEffect(() => {
        const fetchText = async () => {
            if (location.pathname === "/") {
                return;
            }
            try {
                const apiUrl = `http://localhost:3000${location.pathname}`;
                const response = await axios.get<Article>(apiUrl);
                setArticle(response.data);
            } catch (error) {
                console.error("Error fetching Article:", error);
                setArticle({
                    title: "Error fetching Article",
                    segments: []
                });
            }
        };

        fetchText();
    }, [location.pathname]); // re-fetch when URL changes

    const currentText: string =
        currentSegmentIndex === 0
            ? article.title
            : article.segments[currentSegmentIndex - 1].body;

    // auto focus when currentSegmentIndex changes
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentSegmentIndex]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (userInput.length >= currentText.length) {
                setCurrentSegmentIndex(currentSegmentIndex + 1);
                setUserInput("");
            }
        }
    };

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

    return (
        <div onClick={() => inputRef.current?.focus()}>
            {currentSegmentIndex > 0 && (
                <div className={`${classes.typed}`}>
                    <p className="fw-bold">{article.title}<i className={`mx-2 bi bi-arrow-return-left ${classes.typed}`}></i></p>
                    {article.segments.slice(0, currentSegmentIndex - 1).map((seg, idx) => (
                        <p key={idx}>{seg.body}</p>
                    ))}
                </div>
            )}

            <div>
                {currentText.split("").map((letter, index) => (
                    <span key={index} className={getTypingClass(letter, index)}>
                        {letter}
                    </span>
                ))}
                <i className={`mx-2 bi bi-arrow-return-left ${classes.to_type}`}></i>
            </div>


            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="opacity-0 position-absolute"
            />
        </div>
    );
};

export default Typing;
