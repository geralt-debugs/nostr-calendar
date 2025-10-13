import { useState, useCallback, useMemo } from "react";
import { getTimeRangeConfig } from "../stores/events";

export interface RSVPTimeRangeConfig {
  daysBefore: number;
  daysAfter: number;
}

export const DEFAULT_TIME_RANGE_CONFIG = getTimeRangeConfig();

// Function to calculate time range based on configuration
const calculateTimeRange = (config: RSVPTimeRangeConfig = DEFAULT_TIME_RANGE_CONFIG) => {
  const now = Date.now();
  const nowInSeconds = Math.floor(now / 1000);
  const oneDayInSeconds = 86400;
  
  const since = nowInSeconds - (config.daysBefore * oneDayInSeconds);
  const until = nowInSeconds + (config.daysAfter * oneDayInSeconds);
  
  return { since, until };
};

export const useRSVPTimeRange = (initialConfig?: RSVPTimeRangeConfig) => {
  const [config, setConfig] = useState<RSVPTimeRangeConfig>(
    initialConfig || DEFAULT_TIME_RANGE_CONFIG
  );
  
  const updateTimeRange = useCallback((newConfig: Partial<RSVPTimeRangeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  const setDaysBefore = useCallback((days: number) => {
    setConfig(prev => ({ ...prev, daysBefore: Math.max(0, days) }));
  }, []);
  
  const setDaysAfter = useCallback((days: number) => {
    setConfig(prev => ({ ...prev, daysAfter: Math.max(0, days) }));
  }, []);
  
  const resetToDefault = useCallback(() => {
    setConfig(DEFAULT_TIME_RANGE_CONFIG);
  }, []);
  
  const timeRange = useMemo(() => calculateTimeRange(config), [config]);
  
  return {
    config,
    timeRange,
    updateTimeRange,
    setDaysBefore,
    setDaysAfter,
    resetToDefault,
  };
};