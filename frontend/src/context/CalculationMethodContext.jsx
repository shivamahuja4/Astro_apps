'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CalculationMethodContext = createContext();

export const CalculationMethodProvider = ({ children }) => {
    const [method, setMethod] = useState('sidereal');

    useEffect(() => {
        const savedMethod = localStorage.getItem('astro_calculation_method');
        if (savedMethod) {
            setMethod(savedMethod);
        }
    }, []);

    const updateMethod = (newMethod) => {
        setMethod(newMethod);
        localStorage.setItem('astro_calculation_method', newMethod);
    };

    return (
        <CalculationMethodContext.Provider value={{ method, updateMethod }}>
            {children}
        </CalculationMethodContext.Provider>
    );
};

export const useCalculationMethod = () => {
    const context = useContext(CalculationMethodContext);
    if (!context) {
        throw new Error('useCalculationMethod must be used within a CalculationMethodProvider');
    }
    return context;
};
