"use client";

import { useMemo, useState } from "react";
import { Download, FilterX, History, Search } from "lucide-react";
import { EmptyState, Pagination, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";

const PAGE_SIZE = 5;

export default function HistoryPage() {
  const { history, loading, error: storeError, refresh } = useAppStore();
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [action, setAction] = useState("All actions");
  const [status, setStatus] = useState("All status");
  const [page, setPage] = useState(1);
  const actions = [...new Set(history.map((item) => item.action))];
  const filtered = useMemo(() => history.filter((item) => [item.source, item.target, item.action].some((value) => value.toLowerCase().includes(query.toLowerCase())) && (channel === "All channels" || item.channel === channel) && (action === "All actions" || item.action === action) && (status === "All status" || item.status === status)), [history, query, channel, action, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = () => { setQuery(""); setChannel("All channels"); setAction("All actions"); setStatus("All status"); setPage(1); };
  const exportCsv = () => {
    const header = ["time", "source", "target", "channel", "action", "duration", "status", "message"];
    const csv = [header, ...filtered.map((item) => header.map((key) => JSON.stringify(String(item[key as keyof typeof item] ?? ""))))].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `mkt-bot-history-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  return <>
    <section className="page-heading"><div><span className="kicker">AUDIT / INTERACTIONS</span><h1>Interaction History</h1><p>Lịch sử tương tác chéo, trạng thái và thời lượng thực thi.</p></div><button className="button secondary" onClick={exportCsv}><Download size={17} /> Export CSV</button></section>
    {storeError && <div className="inline-notice error-notice">{storeError}<button onClick={() => void refresh()}>Thử lại</button></div>}
    {loading && <div className="loading-line"><span /> Đang tải dữ liệu từ Neon…</div>}
    <section className="filter-panel"><label className="search-field wide"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm user, target hoặc action…" /></label><label><span>Channel</span><select value={channel} onChange={(event) => setChannel(event.target.value)}><option>All channels</option><option>TikTok</option><option>Facebook</option><option>YouTube</option></select></label><label><span>Action</span><select value={action} onChange={(event) => setAction(event.target.value)}><option>All actions</option>{actions.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All status</option><option>Success</option><option>Failed</option></select></label><button className="reset-button" onClick={reset}><FilterX size={16} /> Reset</button></section>
    <section className="data-panel history-panel"><header className="panel-header"><div><h2>Execution log</h2><span>{filtered.length} events · Asia/Bangkok</span></div><span className="live-label"><i /> Live audit trail</span></header>
      {rows.length ? <div className="table-scroll"><table><thead><tr><th>Time</th><th>Source account</th><th>Target</th><th>Channel</th><th>Action</th><th>Duration</th><th>Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong className="mono">{new Date(item.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong><small className="cell-sub">{new Date(item.time).toLocaleDateString("vi-VN")}</small></td><td><strong>{item.source}</strong></td><td>{item.target}</td><td><span className={`channel-label ${item.channel.toLowerCase()}`}>{item.channel}</span></td><td>{item.action}{item.message && <small className="cell-sub danger-text">{item.message}</small>}</td><td className="mono">{item.duration}</td><td><StatusBadge tone={item.status === "Success" ? "success" : "danger"}>{item.status}</StatusBadge></td></tr>)}</tbody></table></div> : <EmptyState icon={<History size={24} />} title="Không có log phù hợp" copy="Không tìm thấy interaction nào với bộ lọc hiện tại." />}
      <footer className="panel-footer"><span>Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} trong {filtered.length}</span><Pagination page={page} pages={pages} onPage={setPage} /></footer>
    </section>
  </>;
}
