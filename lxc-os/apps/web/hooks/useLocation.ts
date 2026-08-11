import { useState, useEffect } from 'react';

interface LocationState {
    city: string;
    region: string; // State
    country_name: string;
    postal: string; // Pincode
    loading: boolean;
    error: string | null;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        city: '',
        region: '',
        country_name: 'India', // Default as requested
        postal: '',
        loading: false,
        error: null
    });

    const detectLocation = async () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Using ipapi.co for free IP-based geolocation
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.error) {
                throw new Error(data.reason || 'Failed to detect location');
            }

            setLocation({
                city: data.city || '',
                region: data.region || '',
                country_name: data.country_name || 'India',
                postal: data.postal || '',
                loading: false,
                error: null
            });
        } catch (err: any) {
            console.error("Location detection failed:", err);
            setLocation(prev => ({ 
                ...prev, 
                loading: false, 
                error: 'Could not auto-detect location. Please enter manually.' 
            }));
        }
    };

    // Auto-detect on mount? 
    // The user requirement implies "user location hook", often used on demand or auto. 
    // Given it's a form, auto-filling is nice but we should avoid aggressive fetching if not needed.
    // However, usually for "defaulting", we do it once.
    
    useEffect(() => {
        detectLocation();
    }, []);

    return { ...location, detectLocation };
};
