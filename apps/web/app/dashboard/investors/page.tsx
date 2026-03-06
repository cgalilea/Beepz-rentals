"use client";

import { useState, useEffect, FormEvent } from "react";
import { api, Investor } from "@/lib/api";
import styles from "./investors.module.css";

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api.listInvestors();
      setInvestors(data);
    } catch (err: any) {
      setError(err.message || "Failed to load investors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ name: "", email: "", phone: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(inv: Investor) {
    setForm({ name: inv.name, email: inv.email, phone: inv.phone });
    setEditingId(inv.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.updateInvestor(editingId, form);
      } else {
        await api.createInvestor(form);
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this investor?")) return;
    await api.deleteInvestor(id);
    await load();
  }

  if (loading) return <p>Loading investors...</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Investors</h1>
        <button className={styles.addBtn} onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Investor
        </button>
      </div>

      {error && !showForm && <div className={styles.error}>{error}</div>}

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Investor" : "New Investor"}</h3>
          {error && <div className={styles.error}>{error}</div>}
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </label>
          <div className={styles.formActions}>
            <button type="submit">{editingId ? "Update" : "Create"}</button>
            <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {investors.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.email}</td>
              <td>{inv.phone}</td>
              <td>
                <button className={styles.editBtn} onClick={() => startEdit(inv)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(inv.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {investors.length === 0 && (
            <tr><td colSpan={4} className={styles.empty}>No investors yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
