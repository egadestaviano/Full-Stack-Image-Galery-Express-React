import { Button } from "react-bootstrap";
import { FaFileCsv } from "react-icons/fa";
import { toast } from "react-toastify";

const ExportButton = () => {
  const handleExport = async () => {
    try {
      // Create a temporary link to trigger the download
      const link = document.createElement("a");
      link.href = "/api/export/products/csv";
      link.download = "products.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export started successfully", {
        position: "top-center",
      });
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to export data";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  return (
    <Button 
      variant="outline-success" 
      onClick={handleExport}
      className="ms-2"
    >
      <FaFileCsv /> Export CSV
    </Button>
  );
};

export default ExportButton;