import React, { createContext, useContext, useMemo, useState } from "react";
import type { ChiefAnalysisSource } from "../services/chief";
import type { CaptureSession, ChiefAnalysisResult } from "../types/analysis";
import type { EthicsScreenResult } from "../types/ethics";

interface SessionContextValue {
  session: CaptureSession | null;
  setSession: (session: CaptureSession | null) => void;
  result: ChiefAnalysisResult | null;
  setResult: (result: ChiefAnalysisResult | null) => void;
  analysisSource: ChiefAnalysisSource | null;
  setAnalysisSource: (source: ChiefAnalysisSource | null) => void;
  chiefFallbackReason: string | null;
  setChiefFallbackReason: (reason: string | null) => void;
  analysisHistoryId: string | null;
  setAnalysisHistoryId: (id: string | null) => void;
  ethics: EthicsScreenResult | null;
  setEthics: (ethics: EthicsScreenResult | null) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CaptureSession | null>(null);
  const [result, setResult] = useState<ChiefAnalysisResult | null>(null);
  const [analysisSource, setAnalysisSource] = useState<ChiefAnalysisSource | null>(null);
  const [chiefFallbackReason, setChiefFallbackReason] = useState<string | null>(null);
  const [analysisHistoryId, setAnalysisHistoryId] = useState<string | null>(null);
  const [ethics, setEthics] = useState<EthicsScreenResult | null>(null);

  const value = useMemo(
    () => ({
      session,
      setSession,
      result,
      setResult,
      analysisSource,
      setAnalysisSource,
      chiefFallbackReason,
      setChiefFallbackReason,
      analysisHistoryId,
      setAnalysisHistoryId,
      ethics,
      setEthics,
      reset: () => {
        setSession(null);
        setResult(null);
        setAnalysisSource(null);
        setChiefFallbackReason(null);
        setAnalysisHistoryId(null);
        setEthics(null);
      },
    }),
    [session, result, analysisSource, chiefFallbackReason, analysisHistoryId, ethics]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
