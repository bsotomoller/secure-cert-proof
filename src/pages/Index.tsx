import { Link } from "react-router-dom";
import { Shield, Search, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/10 mb-6">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Programas Integridad Chile
          </h2>
          <p className="text-lg font-body opacity-85 max-w-xl mx-auto mb-8">
            Certificación de cumplimiento en programas de integridad empresarial.
            Verifique la autenticidad de un certificado de forma segura y anónima.
          </p>
          <Link to="/validar">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold text-base px-8 h-12"
            >
              <Search className="h-5 w-5 mr-2" />
              Validar un Certificado
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Seguro</h3>
              <p className="text-sm text-muted-foreground font-body">
                Los certificados cuentan con código verificador único y código QR para validación inmediata.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Anónimo</h3>
              <p className="text-sm text-muted-foreground font-body">
                La validación es completamente anónima. Solo quien posee el código puede verificar el certificado.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Confiable</h3>
              <p className="text-sm text-muted-foreground font-body">
                Cada certificado incluye firma digital y hash SHA-256 para garantizar su integridad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center mt-auto">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Programas Integridad Chile. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
