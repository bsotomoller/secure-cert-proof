import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LogOut,
  Loader2,
  Ban,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStateInfo(cert: any) {
  if (cert.status === "revoked") {
    return { label: "Revocado", icon: XCircle, className: "text-destructive" };
  }
  if (new Date() >= new Date(cert.expires_at)) {
    return { label: "Vencido", icon: AlertTriangle, className: "text-warning" };
  }
  return { label: "Vigente", icon: CheckCircle2, className: "text-success" };
}

const Admin = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(true);
  const [revokeCode, setRevokeCode] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    loadCertificates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadCertificates = async () => {
    setIsLoadingCerts(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCertificates(data);
    }
    setIsLoadingCerts(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsCreating(true);
    setCreateMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-create-certificate", {
        body: { company_name: companyName.trim() },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error || !data?.ok) {
        setCreateMsg({ type: "error", text: data?.error || "Error al crear certificado" });
        return;
      }

      setCreateMsg({
        type: "success",
        text: `Certificado creado: ${data.certificate.public_code}`,
      });
      setCompanyName("");
      loadCertificates();
    } catch {
      setCreateMsg({ type: "error", text: "Error de conexión" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (code: string) => {
    if (!confirm(`¿Revocar certificado ${code}?`)) return;

    setIsRevoking(true);
    setRevokeMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-revoke", {
        body: { public_code: code },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error || !data?.ok) {
        setRevokeMsg({ type: "error", text: data?.error || "Error al revocar" });
        return;
      }

      setRevokeMsg({ type: "success", text: "Certificado revocado" });
      setRevokeCode("");
      loadCertificates();
    } catch {
      setRevokeMsg({ type: "error", text: "Error de conexión" });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const filtered = certificates.filter(
    (c) =>
      c.public_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">Panel Administrativo</h2>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {/* Create Certificate */}
        <div className="bg-card border rounded-lg p-6 card-shadow mb-8">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            Emitir Certificado
          </h3>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label className="font-body text-sm">Nombre de la empresa</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej: Empresa ABC Ltda."
                required
              />
            </div>
            <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Emitir
            </Button>
          </form>
          {createMsg && (
            <p className={`mt-3 text-sm font-body ${createMsg.type === "success" ? "text-success" : "text-destructive"}`}>
              {createMsg.text}
            </p>
          )}
        </div>

        {/* Revoke by code */}
        <div className="bg-card border rounded-lg p-6 card-shadow mb-8">
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Revocar por Código
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label className="font-body text-sm">Código del certificado</Label>
              <Input
                value={revokeCode}
                onChange={(e) => setRevokeCode(e.target.value.toUpperCase())}
                placeholder="PIC-XXXX-XXXX"
              />
            </div>
            <Button
              variant="destructive"
              disabled={isRevoking || !revokeCode.trim()}
              onClick={() => handleRevoke(revokeCode.trim())}
            >
              {isRevoking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Revocar
            </Button>
          </div>
          {revokeMsg && (
            <p className={`mt-3 text-sm font-body ${revokeMsg.type === "success" ? "text-success" : "text-destructive"}`}>
              {revokeMsg.text}
            </p>
          )}
        </div>

        {/* Certificates list */}
        <div className="bg-card border rounded-lg p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Certificados ({certificates.length})
            </h3>
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 h-9"
              />
            </div>
          </div>

          {isLoadingCerts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 font-body">
              No hay certificados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Código</th>
                    <th className="pb-3 font-medium">Empresa</th>
                    <th className="pb-3 font-medium">Emisión</th>
                    <th className="pb-3 font-medium">Vencimiento</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cert) => {
                    const state = getStateInfo(cert);
                    const StateIcon = state.icon;
                    return (
                      <tr key={cert.id} className="border-b last:border-0">
                        <td className="py-3 font-mono text-xs">{cert.public_code}</td>
                        <td className="py-3">{cert.company_name}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(cert.issued_at)}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(cert.expires_at)}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${state.className}`}>
                            <StateIcon className="h-3.5 w-3.5" />
                            {state.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {cert.pdf_url && (
                              <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  PDF
                                </Button>
                              </a>
                            )}
                            {cert.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleRevoke(cert.public_code)}
                              >
                                Revocar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
