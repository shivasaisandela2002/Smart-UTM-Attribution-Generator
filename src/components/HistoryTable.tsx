"use client";

import React, { useEffect, useState } from "react";
import styles from "./HistoryTable.module.css";
import { SavedLink } from "../lib/db";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy, Link as LinkIcon, BarChart } from "lucide-react";

export default function HistoryTable() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<string | null>(null);

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

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getShortUrl = (shortId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/r/${shortId}`;
    }
    return `/r/${shortId}`;
  };

  if (loading) {
    return <div className={styles.container}>Loading history...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recent Links</h2>
      <div className="glass-panel">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Campaign</th>
              <th>Source / Medium</th>
              <th>URLs & Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>No links generated yet.</div>
                </td>
              </tr>
            ) : (
              links.map((link) => {
                const shortUrl = link.shortId ? getShortUrl(link.shortId) : '';
                return (
                  <tr key={link.id}>
                    <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                    <td>{link.campaign || "-"}</td>
                    <td>
                      {link.source && <span className={styles.tag}>{link.source}</span>}
                      {link.source && link.medium && " / "}
                      {link.medium && <span className={`${styles.tag} ${styles.tagSecondary}`}>{link.medium}</span>}
                    </td>
                    <td>
                      <div className={styles.urlGroup}>
                        {shortUrl && (
                          <div className={styles.shortUrl}>
                            <LinkIcon size={14} />
                            <a href={shortUrl} target="_blank" rel="noreferrer">
                              {link.shortId}
                            </a>
                            <span className={styles.clicks}>
                              <BarChart size={14} /> {link.clicks || 0} clicks
                            </span>
                          </div>
                        )}
                        <div className={styles.urlCell} title={link.fullUrl}>
                          {link.fullUrl}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} onClick={() => handleCopy(link.fullUrl)} title="Copy Full URL">
                          <Copy size={18} />
                        </button>
                        {shortUrl && (
                          <>
                            <button className={styles.iconBtn} onClick={() => handleCopy(shortUrl)} title="Copy Short URL">
                              <LinkIcon size={18} />
                            </button>
                            <button className={styles.iconBtn} onClick={() => setQrModal(shortUrl)} title="View QR Code">
                              <QrCode size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {qrModal && (
        <div className={styles.modalOverlay} onClick={() => setQrModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>QR Code for Short Link</h3>
            <div className={styles.qrContainer}>
              <QRCodeSVG value={qrModal} size={256} level="H" includeMargin={true} />
            </div>
            <p className={styles.modalUrl}>{qrModal}</p>
            <button className={styles.closeBtn} onClick={() => setQrModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
