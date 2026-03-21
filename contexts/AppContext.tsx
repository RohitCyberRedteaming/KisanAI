import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanRecord {
  id: string;
  diseaseName: string;
  imageUri: string;
  confidence: number;
  date: string;
  symptoms: string;
  treatment: string[];
  severity: string;
}

interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  login: (name: string, phone: string, location: string) => Promise<void>;
  logout: () => Promise<void>;
  // Scans
  scanHistory: ScanRecord[];
  addScan: (scan: ScanRecord) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  isLoggedIn: false,
  farmerName: '',
  farmerPhone: '',
  farmerLocation: '',
  login: async () => {},
  logout: async () => {},
  scanHistory: [],
  addScan: async () => {},
  clearHistory: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved data on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [name, phone, location, loggedIn, history] = await Promise.all([
          AsyncStorage.getItem('farmer_name'),
          AsyncStorage.getItem('farmer_phone'),
          AsyncStorage.getItem('farmer_location'),
          AsyncStorage.getItem('is_logged_in'),
          AsyncStorage.getItem('scan_history'),
        ]);
        if (loggedIn === 'true' && name) {
          setIsLoggedIn(true);
          setFarmerName(name);
          setFarmerPhone(phone || '');
          setFarmerLocation(location || 'लखनऊ, उत्तर प्रदेश');
        }
        if (history) {
          setScanHistory(JSON.parse(history));
        }
      } catch (e) {
        console.log('Error loading data:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, []);

  const login = async (name: string, phone: string, location: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('farmer_name', name),
        AsyncStorage.setItem('farmer_phone', phone),
        AsyncStorage.setItem('farmer_location', location),
        AsyncStorage.setItem('is_logged_in', 'true'),
      ]);
      setFarmerName(name);
      setFarmerPhone(phone);
      setFarmerLocation(location);
      setIsLoggedIn(true);
    } catch (e) {
      console.log('Login save error:', e);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('farmer_name'),
        AsyncStorage.removeItem('farmer_phone'),
        AsyncStorage.removeItem('farmer_location'),
        AsyncStorage.removeItem('is_logged_in'),
      ]);
      setIsLoggedIn(false);
      setFarmerName('');
      setFarmerPhone('');
      setFarmerLocation('');
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  const addScan = async (scan: ScanRecord) => {
    try {
      const updated = [scan, ...scanHistory].slice(0, 50); // keep last 50 scans
      setScanHistory(updated);
      await AsyncStorage.setItem('scan_history', JSON.stringify(updated));
    } catch (e) {
      console.log('Save scan error:', e);
    }
  };

  const clearHistory = async () => {
    try {
      setScanHistory([]);
      await AsyncStorage.removeItem('scan_history');
    } catch (e) {
      console.log('Clear history error:', e);
    }
  };

  // Don't render children until data is loaded
  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      isLoggedIn, farmerName, farmerPhone, farmerLocation,
      login, logout, scanHistory, addScan, clearHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
