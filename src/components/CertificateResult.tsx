import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  Hash,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateData {
  company_name: string;
  issued_at: string;
  expires_at: string;
  public_code: string;
  state: "active" | "expired" | "revoked";
  pdf_url: string;
}

interface CertificateResultProps {
  certificate: CertificateData;
}

const stateConfig = {
  active: {
    label: "Certificado Vigente",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
    badgeClass: "bg-success text-success-foreground",
  },
  expired: {
    label: "Certificado Vencido",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning border-warning/20",
    badgeClass: "bg-warning text-warning-foreground",
  },
  revoked: {
    label: "Certificado Revocado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    badgeClass: "bg-destructive text-destructive-foreground",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const CertificateResult = ({ certificate }: CertificateResultProps) => {
  const config = stateConfig[certificate.state];
  const Icon = config.icon;

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Status badge */}
      <div className={`rounded-lg border-2 p-6 ${config.className}`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon className="h-8 w-8" />
          <span className="text-xl font-display font-bold">{config.label}</span>
        </div>
      </div>

      {/* Certificate details */}
      <div className="mt-6 bg-card rounded-lg border p-6 card-shadow space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-body">Empresa</p>
            <p className="font-display font-semibold text-lg">{certificate.company_name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-body">Emisión</p>
            <p className="font-body font-medium">{formatDate(certificate.issued_at)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-body">Vencimiento</p>
            <p className="font-body font-medium">{formatDate(certificate.expires_at)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Hash className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-body">Código verificador</p>
            <p className="font-mono font-bold tracking-wider">{certificate.public_code}</p>
          </div>
        </div>

        {certificate.pdf_url && certificate.state === "active" && (
          <div className="pt-2">
            <a href={certificate.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Ver / Descargar Certificado (PDF)
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateResult;
