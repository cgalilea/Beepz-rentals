"use client";

import { useState, useEffect, FormEvent } from "react";
import { api, Vehicle, Investor, ProfitShareInput } from "@/lib/api";
import styles from "./vehicles.module.css";

const emptyVehicle = {
  make: "", model: "", year: new Date().getFullYear(), licensePlate: "", vin: "",
};

const defaultShares: ProfitShareInput[] = [
  { participantType: "BEEPZ", percentage: 100 },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVehicle);
  const [shares, setShares] = useState<ProfitShareInput[]>(defaultShares);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [v, i] = await Promise.all([api.listVehicles(), api.listInvestors()]);
      setVehicles(v);
      setInvestors(i);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalPct = shares.reduce((sum, s) => sum + s.percentage, 0);

  function resetForm() {
    setForm(emptyVehicle);
    setShares(defaultShares);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(v: Vehicle) {
    setForm({ make: v.make, model: v.model, year: v.year, licensePlate: v.licensePlate, vin: v.vin });
    setShares(v.profitShares.map((ps) => ({
      participantType: ps.participantType,
      investorId: ps.investorId,
      percentage: parseFloat(ps.percentage),
    })));
    setEditingId(v.id);
    setShowForm(true);
    setError("");
  }

  function addInvestorRow() {
    setShares([...shares, { participantType: "INVESTOR", investorId: "", percentage: 0 }]);
  }

  function removeRow(index: number) {
    setShares(shares.filter((_, i) => i !== index));
  }

  function updateShare(index: number, field: string, value: any) {
    const updated = [...shares];
    (updated[index] as any)[field] = value;
    setShares(updated);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (Math.abs(totalPct - 100) > 0.01) {
      setError(`Profit shares must total 100%. Currently: ${totalPct}%`);
      return;
    }

    const payload = {
      ...form,
      profitShares: shares.map((s) => ({
        participantType: s.participantType,
        investorId: s.participantType === "INVESTOR" ? s.investorId : null,
        percentage: s.percentage,
      })),
    };

    try {
      if (editingId) {
        await api.updateVehicle(editingId, payload);
      } else {
        await api.createVehicle(payload);
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    await api.deleteVehicle(id);
    await load();
  }

  if (loading) return <p>Loading vehicles...</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Vehicles</h1>
        <button className={styles.addBtn} onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Vehicle
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Vehicle" : "New Vehicle"}</h3>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.grid}>
            <label>Make<input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required /></label>
            <label>Model<input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></label>
            <label>Year<input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} required /></label>
            <label>License Plate<input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} required /></label>
            <label>VIN<input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required /></label>
          </div>

          <div className={styles.profitSection}>
            <div className={styles.profitHeader}>
              <h4>Profit Distribution</h4>
              <span className={`${styles.totalBadge} ${Math.abs(totalPct - 100) < 0.01 ? styles.totalOk : styles.totalBad}`}>
                Total: {totalPct}%
              </span>
            </div>

            {shares.map((share, i) => (
              <div key={i} className={styles.shareRow}>
                <span className={styles.shareType}>
                  {share.participantType === "BEEPZ" ? "Beepz" : "Investor"}
                </span>

                {share.participantType === "INVESTOR" && (
                  <select
                    value={share.investorId || ""}
                    onChange={(e) => updateShare(i, "investorId", e.target.value)}
                    required
                    className={styles.investorSelect}
                  >
                    <option value="">Select investor...</option>
                    {investors.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.name}</option>
                    ))}
                  </select>
                )}

                <div className={styles.pctInput}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={share.percentage}
                    onChange={(e) => updateShare(i, "percentage", parseFloat(e.target.value) || 0)}
                    required
                  />
                  <span>%</span>
                </div>

                {share.participantType === "INVESTOR" && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeRow(i)}>X</button>
                )}
              </div>
            ))}

            <button type="button" className={styles.addShareBtn} onClick={addInvestorRow}>
              + Add Investor Share
            </button>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={Math.abs(totalPct - 100) > 0.01}>
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>License Plate</th>
            <th>Status</th>
            <th>Profit Distribution</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td>{v.year} {v.make} {v.model}</td>
              <td>{v.licensePlate}</td>
              <td><span className={`${styles.status} ${styles[`status${v.status}`]}`}>{v.status}</span></td>
              <td>
                {v.profitShares.map((ps) => (
                  <div key={ps.id} className={styles.shareInfo}>
                    {ps.participantType === "BEEPZ" ? "Beepz" : ps.investor?.name}: {ps.percentage}%
                  </div>
                ))}
              </td>
              <td>
                <button className={styles.editBtn} onClick={() => startEdit(v)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(v.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {vehicles.length === 0 && (
            <tr><td colSpan={5} className={styles.empty}>No vehicles yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
