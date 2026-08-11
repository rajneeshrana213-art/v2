
import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import { UseFormSetValue, UseFormWatch, Control, Controller } from 'react-hook-form';
import { MapPin, Globe, Building } from 'lucide-react';

interface LocationSelectorProps {
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    errors: any;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ control, setValue, watch, errors }) => {
    const selectedCountry = watch('country');
    const selectedState = watch('state');

    // Get all countries
    const countries = Country.getAllCountries();

    // Ensure default country is India if not already set
    useEffect(() => {
        if (!selectedCountry) {
            const india = countries.find(c => c.name.toLowerCase() === 'india');
            if (india) {
                setValue('country', india.name, { shouldValidate: true, shouldDirty: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get states based on selected country
    const states = selectedCountry
        ? State.getStatesOfCountry(countries.find(c => c.name === selectedCountry)?.isoCode || '')
        : [];

    // Get cities based on selected state
    const cities = selectedState
        ? City.getCitiesOfState(
            countries.find(c => c.name === selectedCountry)?.isoCode || '',
            states.find(s => s.name === selectedState)?.isoCode || ''
        )
        : [];

    useEffect(() => {
        // Find country object to get ISO code for state lookup
        const countryObj = countries.find(c => c.name === selectedCountry);
        if (!countryObj) return;

        // If state is selected but doesn't belong to new country, reset it
        const stateObj = states.find(s => s.name === selectedState);
        if (selectedState && !stateObj) {
            setValue('state', '');
            setValue('city', '');
        }
    }, [selectedCountry, setValue, countries, selectedState, states]);

    useEffect(() => {
        // Reset city if state changes
        if (selectedState) {
            const stateObj = states.find(s => s.name === selectedState);
            const cityObj = cities.find(c => c.name === watch('city'));
            if (watch('city') && !cityObj) {
                setValue('city', '');
            }
        } else {
            setValue('city', '');
        }
    }, [selectedState, setValue, watch, cities, states]);

    const selectClass = "w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 pl-11 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-500/40 appearance-none";
    const wrapperClass = "relative";
    const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Country */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Country</label>
                <div className={wrapperClass}>
                    <Globe className={iconClass} />
                    <Controller
                        control={control}
                        name="country"
                        render={({ field }) => (
                            <select {...field} className={selectClass}>
                                <option value="" className="dark:bg-gray-800">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.name} className="dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                </div>
                {errors.country && <p className="text-red-500 text-xs ml-1">{errors.country.message}</p>}
            </div>

            {/* State */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">State</label>
                <div className={wrapperClass}>
                    <MapPin className={iconClass} />
                    <Controller
                        control={control}
                        name="state"
                        render={({ field }) => (
                            <select {...field} className={selectClass} disabled={!selectedCountry}>
                                <option value="" className="dark:bg-gray-800">Select State</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.name} className="dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                </div>
                {errors.state && <p className="text-red-500 text-xs ml-1">{errors.state.message}</p>}
            </div>

            {/* City */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">City</label>
                <div className={wrapperClass}>
                    <Building className={iconClass} />
                    <Controller
                        control={control}
                        name="city"
                        render={({ field }) => (
                            <select {...field} className={selectClass} disabled={!selectedState}>
                                <option value="" className="dark:bg-gray-800">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.name} value={city.name} className="dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                </div>
                {errors.city && <p className="text-red-500 text-xs ml-1">{errors.city.message}</p>}
            </div>
        </div>
    );
};
