import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import axios from "axios";
import classes from "./TopBar.module.css";

interface WikiSearchProps {
    selectedLangCode: string;
}

const WikipediaSearch: React.FC<WikiSearchProps> = ({ selectedLangCode }) => {
    const [query, setQuery] = useState<string>("");

    // results: array that holds search results returned from the Wikipedia API
    const [results, setResults] = useState<any[]>([]);

    const [showResults, setShowResults] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const fetchResults = async () => {
        if (query.trim().length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await axios.get(
                `https://${selectedLangCode}.wikipedia.org/w/api.php`, {
                params: {
                    action: 'query',
                    list: 'search',
                    format: 'json',
                    origin: '*',
                    srsearch: query
                }
            }
            );

            // update the results state with the first 5 results
            setResults(response.data.query.search.slice(0, 5));
            setShowResults(true);
        } catch (error) {
            console.error("Error fetching data:", error);
            setResults([]);
            setShowResults(false);
        }
    };

    // use a debounce delay so that API is not called on every single keystroke
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        // clear the timeout if query changes before timeout time has passed
        return () => clearTimeout(timeoutId);
    }, [query, selectedLangCode]);

    return (
        <>
            <Form.Control
                type="text"
                placeholder="Search for article..."
                value={query}
                onChange={handleInputChange}
                className="border-0 shadow-sm"
            />

            {showResults && results.length > 0 && (
                <ListGroup
                    className={`
            position-absolute bg-transparent border-0 shadow-lg bg-body my-2
            ${classes.blur}
            ${classes.search_select}
        `}>

                    {results.map((result) => (
                        <ListGroup.Item
                            key={result.pageid} action
                            target="_blank"
                            onClick={() => navigate(
                                `https://${selectedLangCode}.wikipedia.org/` +
                                `wiki/${encodeURIComponent(result.title)}`)}
                            className={`
                                bg-transparent border-0 rounded-3 my-2
                                ${classes.select_dropdown}
                            `}
                        >
                            <div className="font-serif fs-5">
                                {result.title}
                            </div>

                            <div
                                dangerouslySetInnerHTML={
                                    { __html: result.snippet + "..." }
                                }
                            />

                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </>
    );
};

export default WikipediaSearch;

