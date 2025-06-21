"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth/auth-context";
import AddressSelector from "@/components/profile/address-selector";

const addressSchema = z.object({
  city: z.string().min(1, { message: "City is required" }),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFallbackProps {
  onSelected: (address: { city: string }) => void;
}

export default function AddressFallback({ onSelected }: AddressFallbackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  async function onSubmit() {
    if (!user || !selectedAddress || !selectedAddress.city) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter at least the city for your address.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/onboarding/save-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: selectedAddress }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save address");
      }

      toast({
        title: "Address saved",
        description: "Your address has been saved successfully.",
      });

      onSelected(selectedAddress);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save address",
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icons.mapPin className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Google Maps unavailable
            </h3>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              <p>Please enter your address details manually.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* <AddressSelector onAddressSelect={handleAddressSelect} /> */}
        <input type="text" onChange={(e)=>{
          const address = e.target.value;
          setSelectedAddress(address);
        }}/>
        <Button
          type="submit"
          className="w-full"
          disabled={isSaving || !selectedAddress || !selectedAddress.city}
        >
          {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </div>
  );
}
