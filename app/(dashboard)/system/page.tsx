"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Clock3, Cloud, Database, ExternalLink, Globe2, Mail, Play, RefreshCw, ServerCog, ShieldCheck, TriangleAlert } from "lucide-react";
import { automationJobs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui";

export default function SystemPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const trigger = (name: string) => {
    setRunning(name);
    window.setTimeout(() => { setRunning(null); setLastTriggered(name); }, 900);
  };
  return <>
    <section className="page-heading"><div><span className="kicker">INFRASTRUCTURE / CONTROL PLANE</span><h1>System Architecture</h1><p>Trạng thái hạ tầng, integrations và các scheduled jobs.</p></div><span className="environment-badge"><span /> PRODUCTION · DRY RUN</span></section>
    {lastTriggered && <div className="inline-notice"><CheckCircle2 size={16} />Đã tạo dry-run cho “{lastTriggered}”. Không có tác vụ bên ngoài nào được gửi.<button onClick={() => setLastTriggered(null)}>×</button></div>}
    <section className="architecture-grid">
      <article className="architecture-card core-card"><header><span className="architecture-icon"><ServerCog size={22} /></span><div><h2>Core infrastructure</h2><p>Application and data layer</p></div><StatusBadge tone="success">Operational</StatusBadge></header><div className="infra-pair"><div className="infra-item"><span><Globe2 size={20} /></span><div><b>Web application</b><p>Next.js App Router on Vercel</p><small><i /> affiliate.hopper.capital</small></div></div><div className="infra-item"><span className="blue"><Database size={20} /></span><div><b>Database layer</b><p>Neon Serverless PostgreSQL + Prisma</p><small><i /> Connected via pooled URL</small></div></div></div></article>
      <article className="architecture-card email-card"><header><span className="architecture-icon"><Mail size={22} /></span><div><h2>Email delivery</h2><p>Reports and operations alerts</p></div></header><div className="integration-row"><div><b>Brevo API</b><small>Transactional reports</small></div><StatusBadge tone="success">Primary</StatusBadge></div><div className="integration-row"><div><b>Google Workspace</b><small>Identity + mailbox verification</small></div><StatusBadge tone="neutral">Standby</StatusBadge></div></article>
      <article className="architecture-card social-card"><header><span className="architecture-icon"><Cloud size={22} /></span><div><h2>Social integrations</h2><p>Approved API adapters and human handoff</p></div><StatusBadge tone="warning">Approval gated</StatusBadge></header><div className="social-integrations"><div><span className="social-logo tiktok">TK</span><div><b>TikTok API</b><small>Adapter ready · credentials required</small></div></div><div><span className="social-logo facebook">f</span><div><b>Facebook Graph</b><small>Rate-limit aware queue</small></div></div><div><span className="social-logo youtube">▶</span><div><b>YouTube Data API</b><small>OAuth scope required</small></div></div></div><div className="policy-note"><ShieldCheck size={17} /><span>Browser automation and CAPTCHA bypass are intentionally not included. Unsupported steps are queued for operator review.</span></div></article>
    </section>
    <section className="data-panel jobs-panel"><header className="panel-header"><div><h2>Scheduled Tasks</h2><span>Timezone-aware cron orchestration</span></div><span className="mono schedule-zone">ASIA/BANGKOK · UTC+07</span></header><div className="table-scroll"><table><thead><tr><th>Job name</th><th>Schedule</th><th>Last run</th><th>Status</th><th className="align-right">Action</th></tr></thead><tbody>{automationJobs.map((job) => <tr key={job.name}><td><strong>{job.name}</strong><small className="cell-sub">{job.description}</small></td><td><span className="mono schedule-cell">{job.schedule}</span></td><td className="muted">{job.lastRun}</td><td><StatusBadge tone={job.status === "Success" ? "success" : job.status === "Running" ? "warning" : "danger"}>{job.status === "Running" && <RefreshCw size={12} className="spin" />}{job.status}</StatusBadge></td><td className="align-right"><button className="run-button" onClick={() => trigger(job.name)} disabled={running === job.name}>{running === job.name ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}{running === job.name ? "Running" : "Dry run"}</button></td></tr>)}</tbody></table></div></section>
    <section className="system-footer-grid"><article><Activity size={20} /><div><b>Availability</b><strong>99.98%</strong><small>Last 30 days</small></div></article><article><Clock3 size={20} /><div><b>Median job latency</b><strong>1.4s</strong><small>Before provider handoff</small></div></article><article><TriangleAlert size={20} /><div><b>Manual reviews</b><strong>2</strong><small>Awaiting operator</small></div></article><article><ExternalLink size={20} /><div><b>Deployment</b><strong>v1.0.0</strong><small>Vercel production</small></div></article></section>
  </>;
}
