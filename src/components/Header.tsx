import { Link, useLocation } from "react-router-dom";
import logoImg from "@/assets/logo-programas-integridad.png";

const Header = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/login";

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src={logoImg} alt="Programas de Integridad" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-display font-bold leading-tight text-primary">
              Programas de Integridad
            </h1>
            <p className="text-xs text-muted-foreground font-body">Soluciones Empresariales</p>
          </div>
        </Link>
        <nav className="flex gap-1 font-body text-sm">
          <Link
            to="/validar"
            className="px-3 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
          >
            Validar Certificado
          </Link>
          <Link
            to="/empresas"
            className="px-3 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
          >
            Empresas Certificadas
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
