
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-whatsly-50 to-whatsly-100 p-6">
      <div className="w-20 h-20 rounded-full bg-whatsly-100 flex items-center justify-center mb-6">
        <span className="text-whatsly-800 text-4xl font-bold">404</span>
      </div>
      <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
      <p className="text-center text-muted-foreground mb-6 max-w-md">
        Desculpe, a página que você está procurando não existe ou pode ter sido movida.
      </p>
      <Button onClick={() => navigate("/")}>
        Voltar para o Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
