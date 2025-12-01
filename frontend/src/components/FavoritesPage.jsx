import { Col, Row } from "react-bootstrap";
import CardComponent from "./CardComponent.jsx";
import { useEffect } from "react";
import { useFavorites } from "../contexts/FavoritesContext.jsx";
import { Link } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";

const FavoritesPage = () => {
  const { favorites, loadFavorites } = useFavorites();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div className="container mt-3">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Favorite Images</h4>
            <span className="text-muted">
              {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </span>
          </div>
          <hr />
          
          <Link className="btn btn-success mb-3" to="/add">
            <IoMdAdd /> Add New
          </Link>
          
          {favorites.length > 0 ? (
            <Row>
              {favorites.map((product) => (
                <CardComponent
                  key={product.id}
                  product={product}
                  getProducts={loadFavorites}
                />
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <h5>No favorite images yet</h5>
              <p>Click the heart icon on images to add them to your favorites</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default FavoritesPage;