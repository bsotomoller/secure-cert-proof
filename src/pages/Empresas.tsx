import { useState } from "react";
import { Search, Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const Empresas = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<null | { found: boolean; companyName?: string }>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    setIsLoading(true);
    setResult(null);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.rpc("search_certified_companies", {
        search_term: term,
      });

      if (error) {
        setResult({ found: false });
        return;
      }

      if (data && data.length > 0) {
        setResult({ found: true, companyName: data[0].company_name });
      } else {
        setResult({ found: false });
      }
    } catch {
      setResult({ found: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Visualizador de Empresas Certificadas
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Busque por nombre de empresa o RUT para verificar si cuenta con certificación vigente.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-md mx-auto space-y-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre de empresa o RUT"
            className="h-12 text-center text-lg font-body border-2 border-border focus:border-primary focus:ring-primary bg-card"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full h-12 text-base font-body font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Search className="h-5 w-5 mr-2" />
            )}
            Buscar
          </Button>
        </form>

        {hasSearched && !isLoading && result && (
          <div className="mt-8 max-w-md mx-auto animate-fade-in">
            {result.found ? (
              <div className="bg-success/10 border-2 border-success/20 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="font-body font-medium text-success">
                  Esta empresa cumple con el Programa de Integridad y se encuentra certificada.
                </p>
              </div>
            ) : (
              <div className="bg-muted border-2 border-border rounded-lg p-6 text-center">
                <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body font-medium text-muted-foreground">
                  No se encontró certificación vigente para la empresa consultada.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Programas de Integridad. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Empresas;
