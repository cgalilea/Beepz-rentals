"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p style={{ marginTop: "0.5rem", color: "#64748b" }}>
        Beepz Rentals management platform. Select an option from the sidebar.
      </p>
    </div>
  );
}
