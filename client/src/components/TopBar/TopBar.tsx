import React from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"
import classes from "./TopBar.module.css";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";

const TopBar: React.FC = () => {

    const notYetImplemented = () => {
        throw new Error("not yet implemented");
    };

    const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
    const languages: Map<string, string> = new Map([
        ["English", "en"],
        ["Deutsch", "de"],
        ["Svenska", "sv"]
    ]);
    const languageItemClass: string = `rounded-3 ${classes.select_dropdown}`;
    const handleSelect = (eventKey: string | null) => {
        if (eventKey) {
            setSelectedLanguage(eventKey);
        }
        return;

    };

    return (
        <>
            <Navbar sticky="top">
                <Navbar.Brand
                    href="/"
                    className={`fs-1  mx-2 ${classes.brand}`}
                >
                    WikipediaTyper
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link
                        onClick={notYetImplemented}
                        className={`icon-link pb-0 ${classes.icon}`}
                    >
                        <i className="fs-5 bi-shuffle"></i>
                    </Nav.Link>
                    <Nav.Link
                        onClick={notYetImplemented}
                        className={`icon-link pb-0 ${classes.icon}`}
                    >
                        <i className="fs-5 bi-hourglass"></i>
                    </Nav.Link>
                </Nav>
                <Form className="mx-2">
                    <Form.Control
                        type="search"
                        placeholder="Search for article..."
                        aria-label="Search"
                        className="border-0 shadow-sm"
                    />
                </Form>
                <Dropdown onSelect={handleSelect}>
                    <Dropdown.Toggle className={`
                        border-0 shadow-sm bg-body 
                        ${classes.language_select}
                        ${classes.min_width}
                    `}>
                        {selectedLanguage}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className={`
                        bg-transparent border-0 shadow-lg
                        ${classes.select_menu}
                        ${classes.min_width}
                    `}>
                        {[...languages.keys()].map((name) => (
                            <Dropdown.Item
                                key={name}
                                eventKey={name}
                                data-value={languages.get(name)}
                                className={languageItemClass}
                            >
                                {name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar >
        </>
    )
}

export default TopBar;
