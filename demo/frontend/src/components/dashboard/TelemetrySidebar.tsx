import React, { useState, useEffect } from 'react';
import { TELEMETRY_STATS, TECHNICAL_METRICS, ADAPTER_INFO } from '@/src/data/mockData';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

// [PHASE 4 WIRING] - Replace X.X with Person 1's IPv4 address!
const BASE_URL = "http://localhost:8000";

const TelemetrySidebar = () => {
  // State to hold our real Python backend data
  const [liveData, setLiveData] = useState<any>(null);

  // The Live Wire
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/telemetry`);
        if (!res.ok) throw new Error("Backend not responding");

        const data = await res.json();
        setLiveData(data); // Inject the live data
      } catch (error) {
        console.error("Using fallback telemetry:", error);
        setLiveData(null); // Triggers the safe fallback to mockData
      }
    };

    fetchTelemetry(); // Initial fetch
    const intervalId = setInterval(fetchTelemetry, 2000); // Ping every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  // --- DYNAMIC DATA MAPPING ---
  // If we have liveData, map it to match your UI's expected format. Otherwise, use mock fallback.

  const displayStats = liveData ? [
    { label: 'TOKENS / SEC', value: liveData.tokens_per_sec.toFixed(2), unit: 't/s', hasWaveform: true },
    { label: 'VRAM USAGE', value: `${liveData.vram_used_gb.toFixed(2)} / ${liveData.vram_total_gb.toFixed(2)} GB`, progress: liveData.vram_used_gb / liveData.vram_total_gb },
    { label: 'HYPERNETWORK STATUS', value: liveData.hypernetwork_status, status: liveData.hypernetwork_status === 'ACTIVE' ? 'success' : 'warning' },
  ] : TELEMETRY_STATS;

  const displayMetrics = liveData ? [
    { label: 'DIMENSION', value: liveData.embedding_dimension.toString() },
    { label: 'NORM (L2)', value: liveData.embedding_norm.toFixed(3) },
    { label: 'SPARSITY', value: liveData.embedding_sparsity.toFixed(3) },
    { label: 'ENTROPY', value: liveData.embedding_entropy.toFixed(3) },
  ] : TECHNICAL_METRICS;

  const displayAdapter = liveData
    ? { size: `${liveData.adapter_size_mb} MB` }
    : ADAPTER_INFO;

  // --- RENDER (Unchanged from your original beautiful UI) ---
  return (
    <div className="flex flex-col h-full bg-bg-primary border-l border-border-soft overflow-y-auto custom-scrollbar">
      <div className="technical-label text-text-muted px-5 py-4">
        LIVE TELEMETRY {liveData ? <span className="text-accent-green ml-2">● ONLINE</span> : <span className="text-yellow-500 ml-2">● MOCK</span>}
      </div>

      <div className="flex flex-col gap-0">
        {displayStats.map((stat, i) => (
          <div
            key={stat.label}
            className="p-5 border-b border-border-soft flex flex-col gap-2 group hover:bg-[#080808] transition-colors"
          >
            <div className="flex justify-between items-start">
              <span className="tiny-metadata text-text-muted">{stat.label}</span>
              {stat.unit && <span className="tiny-metadata text-text-disabled">{stat.unit}</span>}
            </div>

            <div className={cn(
              "telemetry-number",
              stat.status === 'success' ? "text-accent-green glitch-glow" : "text-text-primary"
            )}>
              {stat.value}
            </div>

            {stat.hasWaveform && (
              <div className="h-6 flex items-end gap-[2px] mt-2">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-accent-green opacity-40 rounded-t-[1px]"
                    animate={{ height: [`${30 + Math.random() * 50}%`, `${50 + Math.random() * 50}%`, `${30 + Math.random() * 50}%`] }}
                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
            )}

            {stat.progress !== undefined && (
              <div className="mt-2 h-1 w-full bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-text-primary transition-all duration-1000"
                  style={{ width: `${stat.progress * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}

        <div className="p-5 mt-4">
          <div className="tiny-metadata text-text-disabled mb-4">DOMAIN EMBEDDING STATS</div>
          <div className="flex flex-col gap-3">
            {displayMetrics.map(metric => (
              <div key={metric.label} className="flex justify-between items-center">
                <span className="tiny-metadata text-text-muted text-[9px]">{metric.label}</span>
                <span className="technical-label text-text-primary">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-border-soft mt-auto bg-bg-secondary">
          <div className="flex justify-between items-center">
            <span className="tiny-metadata text-text-muted">ADAPTER SIZE</span>
            <span className="technical-label text-text-primary">{displayAdapter.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetrySidebar;