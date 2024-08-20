import { Link, Outlet } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const MyNav = () => {
    return (
        <>
          <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
              <Navbar.Brand>Inventory</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link href="/category">Category</Nav.Link>
                  <Nav.Link href="/item">Item</Nav.Link>
                  <Nav.Link href="/loan">Loan</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Outlet/>
      </>
    )
}

export default MyNav;