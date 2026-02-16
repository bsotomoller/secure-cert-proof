import { Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/login";

  return (
    <header className="hero-gradient text-primary-foreground">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-display font-bold leading-tight">
              Programas Integridad Chile
            </h1>
            <p className="text-xs opacity-75 font-body">Certificación de cumplimiento</p>
          </div>
        </Link>
        <nav className="flex gap-4 font-body text-sm">
          <Link
            to="/validar"
            className="px-3 py-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
          >
            Validar Certificado
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
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
