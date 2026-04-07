import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTellerConnect } from "@/hooks/use-teller-connect";

interface ConnectBankButtonProps {
  onConnected?: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function ConnectBankButton({
  onConnected,
  variant = "default",
  className,
}: ConnectBankButtonProps) {
  const { open } = useTellerConnect({ onEnrollmentSaved: onConnected });

  return (
    <Button variant={variant} className={className} onClick={open}>
      <Building2 className="mr-2 h-4 w-4" />
      Connect Bank Account
    </Button>
  );
}
