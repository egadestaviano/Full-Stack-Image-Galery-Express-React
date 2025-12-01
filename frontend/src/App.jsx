import { ToastContainer } from "react-toastify";
import AddProduct from "./components/AddProduct.jsx";
import EditProduct from "./components/EditProduct.jsx";
import NavbarComponent from "./components/NavbarComponent.jsx";
import ProductList from "./components/ProductList.jsx";
import CategoryManagement from "./components/CategoryManagement.jsx";
import FavoritesPage from "./components/FavoritesPage.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext.jsx";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";

function App() {
  return (
    <DarkModeProvider>
      <FavoritesProvider>
        <NavbarComponent />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/edit/:id" element={<EditProduct />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer /> 
      </FavoritesProvider>
    </DarkModeProvider>
  );
}

export default App;