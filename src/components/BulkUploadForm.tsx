"use client";

import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import styles from "./BulkUploadForm.module.css";
import { buildUTMUrl } from "../lib/utmUtils";

interface CSVRow {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export default function BulkUploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [resultCsv, setResultCsv] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  const handleDownloadTemplate = () => {
    const template = "baseUrl,source,medium,campaign,term,content\nhttps://example.com,google,cpc,summer_sale,,";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "utm_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const validRows = rows.filter(r => r.baseUrl && r.source);
        
        // Generate full URLs for valid rows
        const payload = validRows.map(row => {
          const fullUrl = buildUTMUrl({
            baseUrl: row.baseUrl,
            source: row.source,
            medium: row.medium,
            campaign: row.campaign,
            term: row.term,
            content: row.content,
          });
          return { ...row, fullUrl };
        });

        if (payload.length === 0) {
          alert("No valid rows found. Please ensure baseUrl and source are provided.");
          setProcessing(false);
          return;
        }

        try {
          const res = await fetch("/api/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          if (res.ok) {
            const savedLinks = await res.json();
            
            // Prepare output CSV
            const outputRows = savedLinks.map((l: any) => ({
              baseUrl: l.baseUrl,
              source: l.source,
              medium: l.medium,
              campaign: l.campaign,
              term: l.term || "",
              content: l.content || "",
              fullUrl: l.fullUrl,
              shortUrl: `${window.location.origin}/r/${l.shortId}`
            }));
            
            const csvOut = Papa.unparse(outputRows);
            setResultCsv(csvOut);
            setProcessedCount(outputRows.length);
          } else {
            alert("Error saving bulk links.");
          }
        } catch (error) {
          console.error(error);
          alert("Failed to process CSV.");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleDownloadResult = () => {
    if (!resultCsv) return;
    const blob = new Blob([resultCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "utm_generated_links.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      {!resultCsv ? (
        <div className={`glass-panel ${styles.dropzone}`} onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className={styles.icon} size={48} />
          <h3 className={styles.title}>{processing ? "Processing..." : "Click or drag CSV file to upload"}</h3>
          <p className={styles.subtitle}>Upload a CSV with columns: baseUrl, source, medium, campaign, term, content</p>
          <input 
            type="file" 
            accept=".csv" 
            className={styles.hiddenInput} 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            disabled={processing}
          />
          <div className={styles.downloadLink} onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}>
            Download CSV Template
          </div>
        </div>
      ) : (
        <div className={styles.resultCard}>
          <h3 className={styles.successTitle}>Successfully Processed {processedCount} Links!</h3>
          <p className={styles.subtitle} style={{ marginBottom: "24px" }}>
            The links have been added to your history and short links were generated.
          </p>
          <button className={styles.btn} onClick={handleDownloadResult}>
            Download Results CSV
          </button>
          <div style={{ marginTop: "16px" }}>
             <span className={styles.downloadLink} onClick={() => setResultCsv(null)}>Upload another file</span>
          </div>
        </div>
      )}
    </div>
  );
}
