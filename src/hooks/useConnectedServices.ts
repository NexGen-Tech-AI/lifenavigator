// hooks/useConnectedServices.ts
import { useState, useEffect } from 'react';
import { fetchConnectedServices, disconnectService, refreshServices } from '../lib/api/integrations';
import { ConnectedService } from '@/types/integration';

export function useConnectedServices() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchConnectedServices();
      setServices(data);
    } catch (err) {
      setError('Failed to load connected services');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadServices();
  }, []);
  
  const removeService = async (serviceId: string) => {
    try {
      await disconnectService(serviceId);
      setServices(services.filter(service => service.id !== serviceId));
    } catch (err) {
      setError('Failed to disconnect service');
      console.error(err);
    }
  };
  
  const refreshData = async () => {
    try {
      await refreshServices();
      await loadServices();
    } catch (err) {
      setError('Failed to refresh service data');
      console.error(err);
    }
  };
  
  return {
    services,
    isLoading,
    error,
    removeService,
    refreshData,
    reloadServices: loadServices,
  };
}