import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ValidatorFormProps {
  onValidate: (code: string) => void;
  isLoading: boolean;
}

const ValidatorForm = ({ onValidate, isLoading }: ValidatorFormProps) => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onValidate(code.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="relative">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: PIC-XXXX-XXXX"
          className="h-12 text-center text-lg font-mono tracking-wider pr-4 pl-4 border-2 focus:border-accent focus:ring-accent"
          autoFocus
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="w-full h-12 text-base font-body font-semibold bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <Search className="h-5 w-5 mr-2" />
        )}
        Verificar
      </Button>
    </form>
  );
};

export default ValidatorForm;
