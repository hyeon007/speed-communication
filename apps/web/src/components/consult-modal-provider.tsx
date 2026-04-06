'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ConsultModal } from '@/components/consult-modal';

type OpenConsultModalOptions = {
  interestDevice?: string;
};

type ConsultModalContextValue = {
  isConsultModalOpen: boolean;
  openConsultModal: (options?: OpenConsultModalOptions) => void;
  closeConsultModal: () => void;
};

const ConsultModalContext = createContext<ConsultModalContextValue | null>(null);

export function ConsultModalProvider({ children }: { children: ReactNode }) {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [defaultInterestDevice, setDefaultInterestDevice] = useState('');

  const openConsultModal = useCallback((options?: OpenConsultModalOptions) => {
    setDefaultInterestDevice(options?.interestDevice?.trim() ?? '');
    setIsConsultModalOpen(true);
  }, []);

  const closeConsultModal = useCallback(() => {
    setIsConsultModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isConsultModalOpen, openConsultModal, closeConsultModal }),
    [closeConsultModal, isConsultModalOpen, openConsultModal],
  );

  return (
    <ConsultModalContext.Provider value={value}>
      {children}
      <ConsultModal
        isOpen={isConsultModalOpen}
        onCloseAction={closeConsultModal}
        defaultInterestDevice={defaultInterestDevice}
      />
    </ConsultModalContext.Provider>
  );
}

export function useConsultModal() {
  const context = useContext(ConsultModalContext);

  if (!context) {
    throw new Error('useConsultModal must be used within ConsultModalProvider');
  }

  return context;
}
