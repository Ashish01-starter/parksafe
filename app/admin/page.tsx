"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Car,
  Bike,
  Flag,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"facilities" | "reports" | "events">("facilities");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New location form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    area: "T. Nagar",
    parkingType: "parking_lot",
    accessType: "public",
    latitude: "13.0405",
    longitude: "80.2337",
    supportedVehicleTypes: "TWO_WHEELER,FOUR_WHEELER",
    carCapacity: "30",
    twoWheelerCapacity: "20",
    availableCarSpaces: "15",
    availableTwoWheelerSpaces: "10",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adminRes, reportsRes] = await Promise.all([
        fetch("/api/admin"),
        fetch("/api/admin/reports"),
      ]);

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setStats(adminData.stats);
        setLocations(adminData.locations);
        setRecentEvents(adminData.recentEvents);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetDemoData = async () => {
    if (!confirm("Are you sure you want to reset demo locations to initial state? (OSM locations will be preserved)")) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_seed" }),
      });
      if (res.ok) {
        await fetchData();
        alert("Demo data re-seeded successfully!");
      }
    } catch (e) {
      alert("Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_location",
          locationData: formData,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        await fetchData();
        alert("New parking location added!");
      }
    } catch (e) {
      alert("Failed to add parking location");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Return to Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl text-slate-900">parkSafe Admin Console</h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Chennai v2 Hub
                </span>
              </div>
              <p className="text-xs text-slate-500">Facility Operations &amp; Verification Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemoData}
              disabled={isResetting}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>Reset Demo Seed</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facilities</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalFacilities}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {stats.osmFacilities} OSM + {stats.demoFacilities} Demo
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Car Capacity</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">{stats.totalCarAvailable}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">of {stats.totalCarCapacity} spots open</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">2-Wheeler Capacity</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">{stats.total2WAvailable}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">of {stats.total2WCapacity} spots open</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Reports</div>
              <div className="text-3xl font-black text-amber-600 mt-1">{stats.totalReports}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Community feedback log</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("facilities")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === "facilities"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Facilities ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === "reports"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            User Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === "events"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Telemetry &amp; Audit Log
          </button>
        </div>

        {/* Tab 1: Facilities List */}
        {activeTab === "facilities" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-4">Facility Name</th>
                    <th className="p-4">Area / Type</th>
                    <th className="p-4">Vehicles</th>
                    <th className="p-4">Car (4W)</th>
                    <th className="p-4">2-Wheeler</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-bold text-slate-900">
                        {loc.name}
                        {loc.isDemoData ? (
                          <span className="ml-2 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-normal border border-amber-200">
                            Demo
                          </span>
                        ) : (
                          <span className="ml-2 text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-normal border border-sky-200">
                            OSM
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
                        {loc.area} • <span className="capitalize">{loc.parkingType?.replace('_', ' ') || 'lot'}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {loc.supportedVehicleTypes?.includes("TWO_WHEELER") && (
                            <span className="p-1 rounded bg-slate-100" title="Two Wheeler"><Bike className="w-3.5 h-3.5 text-slate-700" /></span>
                          )}
                          {loc.supportedVehicleTypes?.includes("FOUR_WHEELER") && (
                            <span className="p-1 rounded bg-slate-100" title="Four Wheeler"><Car className="w-3.5 h-3.5 text-slate-700" /></span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {loc.availableCarSpaces !== null ? (
                          <span className="text-emerald-700">{loc.availableCarSpaces} / {loc.carCapacity || "?"}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unknown</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {loc.availableTwoWheelerSpaces !== null ? (
                          <span className="text-emerald-700">{loc.availableTwoWheelerSpaces} / {loc.twoWheelerCapacity || "?"}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unknown</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          loc.availabilityStatus === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : loc.availabilityStatus === "LIMITED"
                            ? "bg-amber-100 text-amber-800"
                            : loc.availabilityStatus === "FULL"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {loc.availabilityStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {loc.availabilitySource}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User Reports */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No user reports submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {rep.location?.name || "Facility"}
                        </div>
                        <div className="text-xs font-semibold text-rose-700 mt-0.5">
                          Reported: {rep.reportType?.replace('_', ' ')} ({rep.vehicleType || "ALL"})
                        </div>
                        {rep.details && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-200">
                            &ldquo;{rep.details}&rdquo;
                          </p>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1">
                          Reported on {new Date(rep.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                      {rep.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Telemetry & Audit Events */}
        {activeTab === "events" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">Recent Parking Transactions</h3>
            {recentEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No events recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        evt.eventType === "parked" ? "bg-rose-500" : "bg-emerald-500"
                      }`} />
                      <div>
                        <span className="font-bold text-slate-900">{evt.location?.name}: </span>
                        <span className="text-slate-600 capitalize">{evt.eventType}</span>
                        <span className="ml-1 text-[11px] text-slate-400">({evt.vehicleType})</span>
                        {evt.deltaSpaces !== 0 && (
                          <span className={`ml-1 font-mono font-bold ${
                            evt.deltaSpaces < 0 ? "text-rose-600" : "text-emerald-600"
                          }`}>
                            ({evt.deltaSpaces > 0 ? `+${evt.deltaSpaces}` : evt.deltaSpaces})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-lg text-slate-900 mb-4">Add New Parking Facility</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alwarpet Public Lot"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Facility Type</label>
                  <select
                    value={formData.parkingType}
                    onChange={(e) => setFormData({ ...formData, parkingType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="parking_lot">Public Lot</option>
                    <option value="street">Street Parking</option>
                    <option value="multi_storey">Multi-Level</option>
                    <option value="mall">Mall Parking</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Car (4W) Capacity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.carCapacity}
                    onChange={(e) => setFormData({ ...formData, carCapacity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">2-Wheeler Capacity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.twoWheelerCapacity}
                    onChange={(e) => setFormData({ ...formData, twoWheelerCapacity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
