"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>Dashboard</h2>
          <span className={styles.userBadge}>{user.name} ({user.role})</span>
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
