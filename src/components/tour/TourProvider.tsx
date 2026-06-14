'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  TOUR_STEPS,
  TourStep,
  isTourActive,
  getTourStepIndexForRoute,
  completeTour,
} from '@/lib/tour';

type TourContextValue = {
  isActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  nextStep: () => void;
  skipTour: () => void;
};

const TourContext = createContext<TourContextValue>({
  isActive: false,
  currentStep: null,
  currentStepIndex: -1,
  nextStep: () => {},
  skipTour: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

export default function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(isTourActive());
  }, [pathname]);

  const currentStepIndex = isActive ? getTourStepIndexForRoute(pathname) : -1;
  const currentStep = currentStepIndex >= 0 ? TOUR_STEPS[currentStepIndex] : null;

  const nextStep = useCallback(() => {
    if (currentStepIndex === -1) return;
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= TOUR_STEPS.length) {
      completeTour();
      setIsActive(false);
    } else {
      router.push(TOUR_STEPS[nextIdx].route);
    }
  }, [currentStepIndex, router]);

  const skipTour = useCallback(() => {
    completeTour();
    setIsActive(false);
  }, []);

  return (
    <TourContext.Provider value={{ isActive, currentStep, currentStepIndex, nextStep, skipTour }}>
      {children}
    </TourContext.Provider>
  );
}
