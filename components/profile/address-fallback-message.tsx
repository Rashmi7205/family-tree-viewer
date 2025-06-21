import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddressFallbackMessage() {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Google Maps unavailable</AlertTitle>
      <AlertDescription>
        The map service couldn't be loaded. Please use the manual address entry
        option instead.
      </AlertDescription>
    </Alert>
  );
}
