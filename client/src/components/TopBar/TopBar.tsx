import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"
import classes from "./TopBar.module.css";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";


const TopBar: React.FC = () => {
    const notYetImplemented = () => {
        throw new Error("not yet implemented");
    };

    return (
        <Navbar sticky="top">
            <Navbar.Brand
                href="/"
                className={`fs-1 mx-2 ${classes.brand}`}
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
            <Form>
                <Form.Control
                    type="search"
                    placeholder="Search for article.."
                    aria-label="Search"
                    className="border-0"
                />
            </Form>
            <Form.Select aria-label="Language"
                className={`border-0 mx-1 ${classes.short}`}
            >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="sv">Svenska</option>
            </Form.Select>
        </Navbar >
    )
}

export default TopBar;
