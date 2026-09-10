"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/ui";

type Run = { id: string; jobName: string; status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED"; startedAt: string | null; processed: number; failed: number };

const jobLabels = ["onboarding", "provision", "health", "report"];

export function AutomationRunsPanel() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/automation/runs?limit=8", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load runs");
      setRuns(await response.json() as Run[]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load runs"); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const trigger = async (jobName: string) => {
    setPending(jobName); setError(null);
    try {
      const response = await fetch("/api/automation/runs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobName }) });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? "Unable to queue job");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to queue job"); }
    finally { setPending(null); }
  };
  return <section className="data-panel jobs-panel"><header className="panel-header"><div><h2>Live review runs</h2><span>Dry-run audit queue ? no external social action</span></div><button className="icon-button" onClick={() => void load()} aria-label="Refresh runs"><RefreshCw size={16} /></button></header>{error && <div className="inline-notice error-notice">{error}</div>}<div className="table-scroll"><table><thead><tr><th>Job</th><th>Started</th><th>Queued</th><th>Status</th><th className="align-right">Action</th></tr></thead><tbody>{jobLabels.map((job) => { const run = runs.find((item) => item.jobName === job); const tone = run?.status === "SUCCESS" ? "success" : run?.status === "FAILED" ? "danger" : run?.status === "RUNNING" ? "warning" : "neutral"; return <tr key={job}><td><strong>{job}</strong></td><td className="muted">{run?.startedAt ? new Date(run.startedAt).toLocaleString("vi-VN") : "Not run yet"}</td><td>{run?.processed ?? 0}</td><td><StatusBadge tone={tone}>{run?.status ?? "READY"}</StatusBadge></td><td className="align-right"><button className="run-button" onClick={() => void trigger(job)} disabled={pending !== null}>{pending === job ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}{pending === job ? "Queueing" : "Dry run"}</button></td></tr>; })}</tbody></table></div></section>;
}
