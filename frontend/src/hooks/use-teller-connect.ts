import { useCallback, useRef } from "react";
import { tellerService } from "@/services/teller.service";
import { useToast } from "@/hooks/use-toast";

// Teller Connect global type
declare global {
  interface Window {
    TellerConnect: {
      setup: (config: TellerConnectConfig) => TellerConnectInstance;
    };
  }
}

interface TellerConnectConfig {
  applicationId: string;
  onSuccess: (enrollment: TellerConnectEnrollment) => void;
  onExit?: () => void;
  onFailure?: (failure: { type: string; code: string; message: string }) => void;
}

interface TellerConnectEnrollment {
  accessToken: string;
  enrollment: {
    id: string;
    institution: { name: string };
  };
}

interface TellerConnectInstance {
  open: () => void;
  destroy: () => void;
}

const TELLER_SCRIPT_URL = "https://cdn.teller.io/connect/connect.js";
const APPLICATION_ID = import.meta.env.VITE_TELLER_APPLICATION_ID as string;

function loadTellerScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("teller-connect-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "teller-connect-script";
    script.src = TELLER_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Teller Connect"));
    document.head.appendChild(script);
  });
}

interface UseTellerConnectOptions {
  onEnrollmentSaved?: () => void;
}

export function useTellerConnect({ onEnrollmentSaved }: UseTellerConnectOptions = {}) {
  const tellerInstance = useRef<TellerConnectInstance | null>(null);
  const { toast } = useToast();

  const open = useCallback(async () => {
    if (!APPLICATION_ID) {
      toast({
        title: "Configuration error",
        description: "Teller is not configured. Please add your Application ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      await loadTellerScript();

      if (!window.TellerConnect) {
        throw new Error("window.TellerConnect is undefined after script load");
      }

      if (!tellerInstance.current) {
        tellerInstance.current = window.TellerConnect.setup({
          applicationId: APPLICATION_ID,
          onSuccess: async ({ accessToken, enrollment }) => {
            try {
              await tellerService.saveEnrollment(
                enrollment.id,
                accessToken,
                enrollment.institution.name
              );
              toast({
                title: "Bank connected",
                description: `${enrollment.institution.name} has been linked successfully.`,
              });
              onEnrollmentSaved?.();
            } catch {
              toast({
                title: "Connection failed",
                description: "Could not save your bank connection. Please try again.",
                variant: "destructive",
              });
            }
          },
          onExit: () => {
            // user closed the modal without connecting
          },
          onFailure: ({ message }) => {
            toast({
              title: "Bank connection failed",
              description: message,
              variant: "destructive",
            });
          },
        });
      }

      tellerInstance.current.open();
    } catch (err) {
      console.error("Teller Connect error:", err);
      toast({
        title: "Error",
        description: `Could not load Teller Connect: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    }
  }, [onEnrollmentSaved, toast]);

  return { open };
}
