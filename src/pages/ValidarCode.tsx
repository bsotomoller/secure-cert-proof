import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ValidarCode = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      navigate(`/validar?code=${encodeURIComponent(code)}`, { replace: true });
    } else {
      navigate("/validar", { replace: true });
    }
  }, [code, navigate]);

  return null;
};

export default ValidarCode;
