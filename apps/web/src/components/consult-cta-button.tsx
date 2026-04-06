'use client';

import { type ReactNode } from 'react';
import { useConsultModal } from '@/components/consult-modal-provider';

type ConsultCtaButtonProps = {
  children: ReactNode;
  className?: string;
  interestDevice?: string;
};

export function ConsultCtaButton({ children, className, interestDevice }: ConsultCtaButtonProps) {
  const { openConsultModal } = useConsultModal();

  return (
    <button
      type="button"
      onClick={() => openConsultModal({ interestDevice })}
      className={className}
    >
      {children}
    </button>
  );
}
