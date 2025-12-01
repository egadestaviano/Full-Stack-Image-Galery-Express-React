import { useDarkMode } from "../contexts/DarkModeContext.jsx";
import { Button } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import PropTypes from "prop-types";

const DarkModeToggle = ({ variant = "outline-secondary", size = "md" }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <FaSun /> : <FaMoon />}
    </Button>
  );
};

DarkModeToggle.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string
};

export default DarkModeToggle;