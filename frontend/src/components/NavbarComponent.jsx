import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle.jsx";
import { useFavorites } from "../contexts/FavoritesContext.jsx";
import { FaHeart } from "react-icons/fa";

const NavbarComponent = () => {
  const { favorites } = useFavorites();

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">Image Gallery</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Gallery</Nav.Link>
            <Nav.Link as={Link} to="/add">Add Product</Nav.Link>
            <Nav.Link as={Link} to="/categories">Manage Categories</Nav.Link>
            <Nav.Link as={Link} to="/favorites">
              Favorites {favorites.length > 0 && <span className="badge bg-danger">{favorites.length}</span>}
            </Nav.Link>
          </Nav>
          <Nav>
            <DarkModeToggle variant="outline-primary" />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;