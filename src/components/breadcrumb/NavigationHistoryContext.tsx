import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationEntry {
  pathname: string;
  state?: any;
  label?: string; // Para mostrar en el breadcrumb
}

interface NavigationHistoryContextType {
  history: NavigationEntry[];
  currentIndex: number;
  goTo: (index: number) => void;
  push: (entry: NavigationEntry) => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export const useNavigationHistory = () => {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) throw new Error('useNavigationHistory debe usarse dentro de NavigationHistoryProvider');
  return ctx;
};

export const NavigationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<NavigationEntry[]>([{ pathname: location.pathname }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastPathRef = useRef(location.pathname);
  const currentIndexRef = useRef(0);

  // Mantener currentIndexRef sincronizado
  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Detecta cambios de ruta y actualiza el stack
  React.useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      setHistory(prev => {
        // Buscar si la ruta ya existe en el stack
        const existingIdx = prev.findIndex(e => e.pathname === location.pathname);
        if (existingIdx !== -1) {
          // Si existe, solo mover el índice
          setCurrentIndex(existingIdx);
          lastPathRef.current = location.pathname;
          return prev;
        } else {
          // Si no existe, recortar el stack y agregar la nueva ruta
          let newHistory = prev;
          if (currentIndexRef.current < prev.length - 1) {
            newHistory = prev.slice(0, currentIndexRef.current + 1);
          }
          lastPathRef.current = location.pathname;
          setCurrentIndex(newHistory.length); // nuevo último
          return [...newHistory, { pathname: location.pathname }];
        }
      });
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  // Ir a un punto del historial (no recorta el stack)
  const goTo = useCallback((index: number) => {
    const entry = history[index];
    if (entry && index !== currentIndex) {
      setCurrentIndex(index);
      navigate(entry.pathname, { state: entry.state });
    }
  }, [history, currentIndex, navigate]);

  // Permite pushear manualmente (por si se quiere agregar label custom)
  const push = useCallback((entry: NavigationEntry) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, entry];
    });
    setCurrentIndex(idx => idx + 1);
    navigate(entry.pathname, { state: entry.state });
  }, [currentIndex, navigate]);

  return (
    <NavigationHistoryContext.Provider value={{ history, currentIndex, goTo, push }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}; 