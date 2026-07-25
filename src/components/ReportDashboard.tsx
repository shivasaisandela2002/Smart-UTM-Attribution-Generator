"use client";

import React, { useEffect, useState } from "react";
import styles from "./ReportDashboard.module.css";
import { SavedLink } from "../lib/db";
import { MousePointerClick, Link as LinkIcon, TrendingUp } from "lucide-react";

export default function ReportDashboard() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("/api/links");
        if (res.ok) {
          const data = await res.json();
          setLinks(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  if (loading) {
    return <div>Loading reports...</div>;
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalLinks = links.length;

  // Aggregate by Source
  const sourceMap: Record<string, number> = {};
  // Aggregate by Campaign
  const campaignMap: Record<string, number> = {};

  links.forEach(link => {
    const src = link.source || "Unknown";
    const cmp = link.campaign || "None";
    sourceMap[src] = (sourceMap[src] || 0) + (link.clicks || 0);
    campaignMap[cmp] = (campaignMap[cmp] || 0) + (link.clicks || 0);
  });

  const sortedSources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedCampaigns = Object.entries(campaignMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topSource = sortedSources[0]?.[0] || "-";

  return (
    <div className={styles.container}>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <MousePointerClick className={styles.metricIcon} size={32} />
          <div className={styles.metricValue}>{totalClicks}</div>
          <div className={styles.metricLabel}>Total Clicks</div>
        </div>
        <div className={styles.metricCard}>
          <LinkIcon className={styles.metricIcon} size={32} />
          <div className={styles.metricValue}>{totalLinks}</div>
          <div className={styles.metricLabel}>Links Generated</div>
        </div>
        <div className={styles.metricCard}>
          <TrendingUp className={styles.metricIcon} size={32} />
          <div className={styles.metricValue}>{topSource}</div>
          <div className={styles.metricLabel}>Top Source</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Clicks by Source</h3>
          {sortedSources.length > 0 ? sortedSources.map(([src, clicks]) => {
            const percentage = totalClicks > 0 ? (clicks / totalClicks) * 100 : 0;
            return (
              <div key={src} className={styles.barRow}>
                <div className={styles.barLabel} title={src}>{src}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percentage}%` }}></div>
                </div>
                <div className={styles.barValue}>{clicks}</div>
              </div>
            );
          }) : <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No data yet</div>}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Clicks by Campaign</h3>
          {sortedCampaigns.length > 0 ? sortedCampaigns.map(([cmp, clicks]) => {
            const percentage = totalClicks > 0 ? (clicks / totalClicks) * 100 : 0;
            return (
              <div key={cmp} className={styles.barRow}>
                <div className={styles.barLabel} title={cmp}>{cmp}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percentage}%`, background: "var(--secondary)" }}></div>
                </div>
                <div className={styles.barValue}>{clicks}</div>
              </div>
            );
          }) : <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No data yet</div>}
        </div>
      </div>
    </div>
  );
}
