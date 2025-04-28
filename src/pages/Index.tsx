
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Para fins de demonstração, redirecionamos para a tela de login
    // Em uma aplicação real, verificaríamos se o usuário está logado
    navigate("/login");
  }, [navigate]);
  
  return null;
};

export default Index;
