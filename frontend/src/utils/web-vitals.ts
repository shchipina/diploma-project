import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    INP: [200, 500],
    LCP: [2500, 4000],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function logVital(metric: Metric) {
  const vital: WebVital = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
  };

  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${vital.name}:`, {
      value: `${Math.round(vital.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: vital.rating,
      id: vital.id,
    });
  }

  sendVitalsToBackend(vital);
}

function sendVitalsToBackend(vital: WebVital) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  fetch(`${apiUrl}/metrics/web-vitals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...vital,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch((error) => {
    if (import.meta.env.DEV) {
      console.warn('[Web Vitals] Failed to send metrics:', error);
    }
  });
}

export function initWebVitals() {
  onCLS(logVital);
  onINP(logVital);
  onLCP(logVital);
  onFCP(logVital);
  onTTFB(logVital);
}

export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onLCP(onPerfEntry);
    onFCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}
