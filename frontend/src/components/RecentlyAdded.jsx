import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import CardComponent from "./CardComponent.jsx";
import { toast } from "react-toastify";

const RecentlyAdded = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecentProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products/recent", {
        params: { limit: 5 }
      });
      setRecentProducts(response.data.response);
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to fetch recent products";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecentProducts();
  }, []);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h4>Recently Added</h4>
          <hr />
          
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row>
              {recentProducts && recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <CardComponent
                    key={product.id}
                    product={product}
                    getProducts={getRecentProducts}
                  />
                ))
              ) : (
                <Col>
                  <p className="text-muted">No recent products found.</p>
                </Col>
              )}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RecentlyAdded;