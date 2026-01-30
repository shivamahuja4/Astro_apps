'use client';

import { CalculationMethodProvider } from './context/CalculationMethodContext';

export function Providers({ children }) {
    return (
        <CalculationMethodProvider>
            {children}
        </CalculationMethodProvider>
    );
}
