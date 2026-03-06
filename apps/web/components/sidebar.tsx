"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import styles from "./sidebar.module.css";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Investors", href: "/dashboard/investors" },
  { label: "Vehicles", href: "/dashboard/vehicles" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Beepz Rentals</div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.link} ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? styles.active : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button className={styles.logoutBtn} onClick={logout}>
        Sign Out
      </button>
    </aside>
  );
}
