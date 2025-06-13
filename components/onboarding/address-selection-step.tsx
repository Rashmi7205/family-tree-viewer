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

interface AddressSelectionStepProps {
  onSelected: (address: { city: string }) => void;
  onError: () => void;
}

export default function AddressSelectionStep({
  onSelected,
  onError,
}: AddressSelectionStepProps) {
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
        description: "Please select or enter an address with at least a city.",
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Where do you live?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide your address information. You can use the map or enter
          it manually.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* <AddressSelector onAddressSelect={handleAddressSelect} /> */}
        <input
          type="text"
          onChange={(e) => {
            const address = e.target.value;
            setSelectedAddress(address);
          }}
        />
        {errors.city && (
          <p className="text-sm text-red-500">City is required</p>
        )}

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
