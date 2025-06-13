"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@googlemaps/js-api-loader";
import type { google } from "googlemaps";
// Import the fallback message component
import AddressFallbackMessage from "@/components/profile/address-fallback-message";
import { Icons } from "../icons";

interface AddressSelectorProps {
  onAddressSelect: (address: any) => void;
}

export default function AddressSelector({
  onAddressSelect,
}: AddressSelectorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("map");
  const [manualAddress, setManualAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  // Add a state to track if Google Maps failed to load
  const [mapLoadFailed, setMapLoadFailed] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const initMap = async () => {
      setIsLoading(true);

      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          console.error("Google Maps API key is missing");
          setActiveTab("manual");
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();

        if (mapRef.current) {
          // Initialize map
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 40.749933, lng: -73.98633 },
            zoom: 13,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
          });

          mapInstanceRef.current = map;

          // Initialize autocomplete
          const autocompleteInput = document.getElementById(
            "address-search"
          ) as HTMLInputElement;
          const autocomplete = new google.maps.places.Autocomplete(
            autocompleteInput,
            {
              fields: [
                "address_components",
                "geometry",
                "formatted_address",
                "name",
              ],
              types: ["address"],
            }
          );

          autocompleteRef.current = autocomplete;

          // Initialize marker
          const marker = new google.maps.Marker({
            map,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          markerRef.current = marker;

          // Add event listeners
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              toast({
                variant: "destructive",
                title: "Invalid address",
                description: "Please select an address from the dropdown.",
              });
              return;
            }

            // Update map
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            // Extract address components
            const addressData = extractAddressComponents(place);
            setSelectedAddress(place.formatted_address || "");
            onAddressSelect(addressData);
          });

          // Allow clicking on map to set marker
          map.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              marker.setPosition(e.latLng);
              marker.setVisible(true);

              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  const result = results[0];
                  const addressData = extractAddressComponents(result);
                  setSelectedAddress(result.formatted_address || "");
                  onAddressSelect(addressData);

                  // Update the search input with the selected address
                  if (autocompleteInput) {
                    autocompleteInput.value = result.formatted_address || "";
                  }
                }
              });
            }
          });

          marker.addListener("dragend", () => {
            const position = marker.getPosition();
            if (position) {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: position }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  const result = results[0];
                  const addressData = extractAddressComponents(result);
                  setSelectedAddress(result.formatted_address || "");
                  onAddressSelect(addressData);

                  // Update the search input with the selected address
                  if (autocompleteInput) {
                    autocompleteInput.value = result.formatted_address || "";
                  }
                }
              });
            }
          });

          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setMapLoadFailed(true);
        toast({
          variant: "destructive",
          title: "Map loading failed",
          description:
            "Unable to load Google Maps. Please use manual address entry instead.",
        });
        setActiveTab("manual");
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [toast, onAddressSelect]);

  const extractAddressComponents = (
    place: google.maps.places.PlaceResult | google.maps.GeocoderResult
  ) => {
    let street = "";
    let city = "";
    let state = "";
    let country = "";
    let postalCode = "";

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number") || types.includes("route")) {
          street += component.long_name + " ";
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
        if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      }
    }

    const coordinates = place.geometry?.location
      ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      : null;

    return {
      street: street.trim(),
      city,
      state,
      country,
      postalCode,
      coordinates,
      formatted: place.formatted_address || "",
    };
  };

  const handleManualAddressChange = (field: string, value: string) => {
    setManualAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleManualAddressSubmit = () => {
    if (!manualAddress.city) {
      toast({
        variant: "destructive",
        title: "City is required",
        description: "Please enter at least the city for your address.",
      });
      return;
    }

    const formattedAddress = [
      manualAddress.street,
      manualAddress.city,
      manualAddress.state,
      manualAddress.country,
      manualAddress.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const addressData = {
      ...manualAddress,
      formatted: formattedAddress,
      coordinates: null,
    };

    onAddressSelect(addressData);
    setSelectedAddress(formattedAddress);

    toast({
      title: "Address saved",
      description: "Your address has been saved successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="map"
            disabled={!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          >
            Map Selection
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address-search">Search for your address</Label>
            <Input
              id="address-search"
              placeholder="Start typing your address..."
              disabled={!isMapLoaded}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type your address or click directly on the map to select your
              location
            </p>
          </div>

          <div className="space-y-2">
            <Label>Map</Label>
            <div className="relative">
              <div
                ref={mapRef}
                className="h-64 w-full rounded-lg border bg-slate-100 dark:bg-slate-800"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icons.spinner className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading map...</span>
                  </div>
                </div>
              )}
              {isMapLoaded && (
                <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-md shadow-md text-xs">
                  <p>Click on map to set location</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main St"
                value={manualAddress.street}
                onChange={(e) =>
                  handleManualAddressChange("street", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="New York"
                value={manualAddress.city}
                onChange={(e) =>
                  handleManualAddressChange("city", e.target.value)
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={manualAddress.state}
                  onChange={(e) =>
                    handleManualAddressChange("state", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal/ZIP Code</Label>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={manualAddress.postalCode}
                  onChange={(e) =>
                    handleManualAddressChange("postalCode", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                value={manualAddress.country}
                onChange={(e) =>
                  handleManualAddressChange("country", e.target.value)
                }
              />
            </div>

            <Button
              type="button"
              onClick={handleManualAddressSubmit}
              disabled={!manualAddress.city}
              className="w-full"
            >
              Save Address
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      {mapLoadFailed && activeTab === "manual" && <AddressFallbackMessage />}
      {selectedAddress && (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="font-medium">Selected Address:</p>
          <p className="text-sm">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
}
