"use client";

import { useState } from "react";
import BuilderForm from "@/components/BuilderForm";
import HistoryTable from "@/components/HistoryTable";
import BulkUploadForm from "@/components/BulkUploadForm";
import ReportDashboard from "@/components/ReportDashboard";
import styles from "./page.module.css";
import { Link2, Upload, History, PieChart } from "lucide-react";

type Tab = "builder" | "bulk" | "history" | "reports";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("builder");

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Smart UTM & Attribution Generator</h1>
          <p className={styles.subtitle}>
            Standardize your tracking. Create short links. Generate QR codes. Analyze attribution.
          </p>
        </div>
      </header>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "builder" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("builder")}
        >
          <Link2 size={18} /> Single Link Builder
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "bulk" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("bulk")}
        >
          <Upload size={18} /> Bulk Generator
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "history" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={18} /> History & QR
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "reports" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <PieChart size={18} /> Reports
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "builder" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>URL Builder</h2>
              <p>Generate a new trackable link</p>
            </div>
            <BuilderForm />
          </section>
        )}

        {activeTab === "bulk" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Bulk Generator</h2>
              <p>Upload a CSV to generate multiple links at once</p>
            </div>
            <BulkUploadForm />
          </section>
        )}

        {activeTab === "history" && (
          <section className={styles.section}>
             <div className={styles.sectionHeader}>
              <h2>Link Ledger</h2>
              <p>Manage, copy, and get QR codes for past links</p>
            </div>
            <HistoryTable />
          </section>
        )}

        {activeTab === "reports" && (
          <section className={styles.section}>
             <div className={styles.sectionHeader}>
              <h2>Attribution Dashboard</h2>
              <p>Analyze link performance across sources and campaigns</p>
            </div>
            <ReportDashboard />
          </section>
        )}
      </div>
    </main>
  );
}

