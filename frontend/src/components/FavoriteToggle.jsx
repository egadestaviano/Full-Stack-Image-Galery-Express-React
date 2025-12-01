import { useFavorites } from "../contexts/FavoritesContext.jsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Button, Spinner } from "react-bootstrap";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const FavoriteToggle = ({ productId, size = "md", variant = "link" }) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites();

  const handleToggle = async () => {
    try {
      const response = await toggleFavorite(productId);
      toast.info(response.message, {
        position: "top-center",
      });
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to update favorite";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Spinner animation="border" size="sm" />
      </Button>
    );
  }

  const isFavorited = isFavorite(productId);

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleToggle}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? <FaHeart color="red" /> : <FaRegHeart />}
    </Button>
  );
};

FavoriteToggle.propTypes = {
  productId: PropTypes.number.isRequired,
  size: PropTypes.string,
  variant: PropTypes.string
};

export default FavoriteToggle;