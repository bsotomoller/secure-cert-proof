import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import ValidatorForm from "@/components/ValidatorForm";
import CertificateResult from "@/components/CertificateResult";
import { supabase } from "@/integrations/supabase/client";

const Validar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<any>(null);

  const handleValidate = async (code: string) => {
    setIsLoading(true);
    setError(null);
    setCertificate(null);

    // Update URL
    setSearchParams({ code });

    try {
      const { data, error: fnError } = await supabase.functions.invoke("validate", {
        body: { code },
      });

      if (fnError) {
        setError("Error al validar. Intente nuevamente.");
        return;
      }

      if (!data.ok) {
        setError(data.error || "Código no válido");
        return;
      }

      setCertificate(data.certificate);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Validar Certificado
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Ingrese el código verificador que aparece en el certificado para comprobar su validez.
          </p>
        </div>

        <ValidatorForm onValidate={handleValidate} isLoading={isLoading} />

        {error && (
          <div className="mt-8 max-w-md mx-auto animate-fade-in">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-body text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {certificate && (
          <div className="mt-8">
            <CertificateResult certificate={certificate} />
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Programas Integridad Chile. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Validar;
