import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

interface AddressSuggestion {
  formattedAddress: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

interface AppleMapsAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  testId?: string;
}

export default function AppleMapsAddressInput({
  value,
  onChange,
  placeholder = "Escribe tu dirección...",
  className = "",
  id,
  name,
  required = false,
  testId
}: AppleMapsAddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<any>(null);

  // Initialize Apple Maps Search (fallback to geocoding if MapKit not available)
  useEffect(() => {
    // Wait for MapKit to be available
    const initMapKit = () => {
      if (typeof window !== 'undefined' && (window as any).mapkit) {
        try {
          const mapkit = (window as any).mapkit;
          if (!mapkit.init) {
            // MapKit is loaded but needs initialization
            setTimeout(initMapKit, 100);
            return;
          }
          searchRef.current = new mapkit.Search({
            region: new mapkit.CoordinateRegion(
              new mapkit.Coordinate(19.4326, -99.1332), // Mexico City as default region
              new mapkit.CoordinateSpan(0.5, 0.5)
            )
          });
        } catch (error) {
          console.log('MapKit JS not fully loaded, using fallback geocoding');
        }
      } else {
        // Retry if MapKit is not yet available
        setTimeout(initMapKit, 100);
      }
    };
    
    initMapKit();
  }, []);

  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Use Mapbox Geocoding API for real address suggestions
      const response = await fetch(`/api/geocoding/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && Array.isArray(data.features)) {
        const results = data.features.slice(0, 5).map((feature: any) => ({
          formattedAddress: feature.place_name,
          coordinate: {
            latitude: feature.center[1],
            longitude: feature.center[0]
          }
        }));
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);

    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.formattedAddress);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className}`}
          required={required}
          data-testid={testId}
          autoComplete="off"
        />
        {isLoading && (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.formattedAddress}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.coordinate.latitude.toFixed(4)}, {suggestion.coordinate.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}