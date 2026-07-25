"use client";

import React, { useState, useEffect } from "react";
import styles from "./BuilderForm.module.css";
import { UTMParameters, buildUTMUrl } from "../lib/utmUtils";

const PRESET_SOURCES = ["Google", "Facebook", "LinkedIn", "Twitter", "Newsletter", "Direct"];
const PRESET_MEDIUMS = ["cpc", "social", "email", "organic", "referral", "banner"];

export default function BuilderForm() {
  const [params, setParams] = useState<UTMParameters>({
    baseUrl: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setGeneratedUrl(buildUTMUrl(params));
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!generatedUrl) return;
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...params, fullUrl: generatedUrl }),
      });
      if (response.ok) {
        alert("Link saved to history!");
        // Reset form for next link optionally
      } else {
        alert("Failed to save link.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving link.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel p-6 ${styles.formGrid}`}>
        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
          <label htmlFor="baseUrl" className={styles.label}>Base URL (Required)</label>
          <input
            type="url"
            id="baseUrl"
            name="baseUrl"
            className={styles.input}
            placeholder="https://www.example.com/page"
            value={params.baseUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="source" className={styles.label}>Campaign Source</label>
          <input
            type="text"
            id="source"
            name="source"
            className={styles.input}
            list="sources"
            placeholder="e.g. google, facebook"
            value={params.source}
            onChange={handleChange}
          />
          <datalist id="sources">
            {PRESET_SOURCES.map((src) => (
              <option key={src} value={src} />
            ))}
          </datalist>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="medium" className={styles.label}>Campaign Medium</label>
          <input
            type="text"
            id="medium"
            name="medium"
            className={styles.input}
            list="mediums"
            placeholder="e.g. cpc, email"
            value={params.medium}
            onChange={handleChange}
          />
          <datalist id="mediums">
            {PRESET_MEDIUMS.map((med) => (
              <option key={med} value={med} />
            ))}
          </datalist>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="campaign" className={styles.label}>Campaign Name</label>
          <input
            type="text"
            id="campaign"
            name="campaign"
            className={styles.input}
            placeholder="e.g. summer_sale_2023"
            value={params.campaign}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="term" className={styles.label}>Campaign Term</label>
          <input
            type="text"
            id="term"
            name="term"
            className={styles.input}
            placeholder="e.g. running+shoes"
            value={params.term}
            onChange={handleChange}
          />
        </div>

        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
          <label htmlFor="content" className={styles.label}>Campaign Content</label>
          <input
            type="text"
            id="content"
            name="content"
            className={styles.input}
            placeholder="e.g. logolink, textlink"
            value={params.content}
            onChange={handleChange}
          />
        </div>
      </div>

      {generatedUrl && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Generated URL</h3>
          <div className={styles.urlDisplay}>{generatedUrl}</div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSave}>
              Save to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
