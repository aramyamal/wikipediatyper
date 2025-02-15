import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row } from 'react-bootstrap';
import TopBar from "./components/TopBar/TopBar";

const App: React.FC = () => {
    return (
        <Container className='py-1'>
            <TopBar />
        </Container>
    )
}

export default App;
