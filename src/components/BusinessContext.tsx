"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultBusinessProfile,
  resolveBusiness,
  type ResolvedBusiness,
} from "@/lib/business-profile-shared";

const BusinessContext = createContext<ResolvedBusiness>(
  resolveBusiness(defaultBusinessProfile()),
);

export function BusinessProvider({
  business,
  children,
}: {
  business: ResolvedBusiness;
  children: ReactNode;
}) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
