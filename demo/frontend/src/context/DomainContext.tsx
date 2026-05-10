import React, { createContext, useContext, useState, ReactNode } from 'react';

type Domain = {
  id: string;
  label: string;
  icon: string;
};

interface DomainContextType {
  activeDomain: string;
  setActiveDomain: (id: string) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const DomainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeDomain, setActiveDomain] = useState('code');

  return (
    <DomainContext.Provider value={{ activeDomain, setActiveDomain }}>
      {children}
    </DomainContext.Provider>
  );
};

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
};
