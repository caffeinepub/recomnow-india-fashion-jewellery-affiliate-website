// Type definitions for web-vitals
declare module 'web-vitals' {
  export interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    entries: PerformanceEntry[];
  }

  export type ReportHandler = (metric: Metric) => void;

  export function onCLS(onReport: ReportHandler): void;
  export function onFID(onReport: ReportHandler): void;
  export function onFCP(onReport: ReportHandler): void;
  export function onLCP(onReport: ReportHandler): void;
  export function onTTFB(onReport: ReportHandler): void;
}
