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
    const lastLetterRef = useRef<HTMLSpanElement | null>(null);
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

    // auto focus when currentSegmentIndex changes
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentSegmentIndex]);

    // scroll to the last typed letter when userInput updates
    useEffect(() => {
        if (userInput.length > 0 && lastLetterRef.current) {
            lastLetterRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [userInput]);

    const currentText: string =
        currentSegmentIndex === 0
            ? article.title
            : article.segments[currentSegmentIndex - 1].body;

    const currentArticleType: string =
        currentSegmentIndex === 0
            ? "title"
            : article.segments[currentSegmentIndex - 1].type;

    const upcomingSegments: ArticleSegment[] =
        currentSegmentIndex === 0
            ? article.segments
            : article.segments.slice(currentSegmentIndex);


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

    function getHeaderClass(segmentType: string): string {
        return segmentType === "text"
            ? ""
            : "fw-bold";
    }

    return (
        <div className={`${classes.center}`}
            onClick={() => inputRef.current?.focus()}>
            {/* completed segments */}
            {currentSegmentIndex > 0 && (
                <div className={classes.typed}>
                    <p className="fw-bold">
                        {article.title}
                        <i className={`mx-2 bi bi-arrow-return-left 
                            ${classes.typed}`}
                        ></i>{"\n"}
                    </p>
                    {article.segments.
                        slice(0, currentSegmentIndex - 1)
                        .map((seg, idx) => (
                            <p className={`${getHeaderClass(seg.type)}`}
                                key={idx}>
                                {seg.body}
                                <i className={`mx-2 bi bi-arrow-return-left 
                                ${classes.typed}`}></i>{"\n"}
                            </p>
                        ))}
                </div>
            )}

            <div>
                {currentText.split("").map((letter, index) => {
                    const isCursor = index === userInput.length - 1;
                    return (
                        <span
                            key={index}
                            ref={isCursor ? lastLetterRef : null}
                            className={`${getHeaderClass(currentArticleType)} 
                                        ${getTypingClass(letter, index)}`}
                        >
                            {letter}
                        </span>
                    );
                })}
                <i className={`mx-2 bi bi-arrow-return-left 
                    ${classes.to_type}`}></i>{"\n"}
            </div>

            {upcomingSegments.length > 0 && (
                <div className={classes.to_type}>
                    {upcomingSegments.map((seg, idx) => (
                        <p className={`${getHeaderClass(seg.type)}`}
                            key={idx}>{seg.body}
                            <i className={`mx-2 bi bi-arrow-return-left 
                                ${classes.to_type}`}
                            ></i>{"\n"}
                        </p>
                    ))}
                </div>
            )}

            {/* invisible input to capture keystrokes */}
            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="opacity-0 position-fixed"
            />
        </div>
    );
};

export default Typing;
