"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Network, Plus, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { Donut } from "@/components/donut";
import { Drawer, EmptyState, Pagination, StatusBadge, Toggle } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";
import type { Frequency, Platform } from "@/lib/types";

const channels: Platform[] = ["TikTok", "Facebook", "YouTube"];
const frequencies: Frequency[] = ["Once a day", "Once a week", "Once a month"];
const PAGE_SIZE = 6;

export default function SubscriptionsPage() {
  const { subscriptions, loading, error: storeError, refresh, addSubscription, toggleSubscription } = useAppStore();
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("All channels");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ userId: string; channel: Platform; frequency: Frequency; timePeriod: string }>({ userId: "", channel: "TikTok", frequency: "Once a day", timePeriod: "06:00–12:00" });
  const [error, setError] = useState("");

  const filtered = useMemo(() => subscriptions.filter((subscription) => (subscription.userId.toLowerCase().includes(query.toLowerCase())) && (channelFilter === "All channels" || subscription.channel === channelFilter)), [subscriptions, query, channelFilter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = subscriptions.filter((item) => item.enabled).length;
  const daily = subscriptions.filter((item) => item.frequency === "Once a day").length;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.userId.trim()) return setError("User ID là bắt buộc.");
    if (subscriptions.some((item) => item.userId === form.userId.trim() && item.channel === form.channel)) return setError("Partner và channel này đã tồn tại.");
    try {
      await addSubscription({ ...form, userId: form.userId.trim(), enabled: true });
      setOpen(false); setError(""); setForm({ userId: "", channel: "TikTok", frequency: "Once a day", timePeriod: "06:00–12:00" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo subscription trong Neon.");
    }
  };

  return <>
    <section className="page-heading"><div><span className="kicker">NETWORK / SCHEDULING</span><h1>Subscription Network</h1><p>Thiết lập đối tác và nhịp tương tác chéo theo từng kênh.</p></div><button className="button primary" onClick={() => setOpen(true)}><Plus size={17} /> Thêm partner</button></section>
    {storeError && <div className="inline-notice error-notice">{storeError}<button onClick={() => void refresh()}>Thử lại</button></div>}
    {loading && <div className="loading-line"><span /> Đang tải dữ liệu từ Neon…</div>}
    <section className="metric-grid subscription-metrics">
      <article className="metric-card featured compact-metric"><span className="metric-icon"><Network size={20} /></span><div><strong>{subscriptions.length}</strong><span>Partner channels</span></div><small>3 nền tảng được hỗ trợ</small></article>
      <article className="metric-card compact-metric"><span className="metric-icon blue"><UsersRound size={20} /></span><div><strong>{active}</strong><span>Đang hoạt động</span></div><small>{subscriptions.length - active} đã tạm dừng</small></article>
      <article className="metric-card compact-metric"><span className="metric-icon violet"><CalendarClock size={20} /></span><div><strong>{daily}</strong><span>Tương tác hằng ngày</span></div><small>Ưu tiên xử lý đầu tiên</small></article>
      <article className="metric-card"><div className="metric-heading"><span><b>Activation rate</b><small>Current network</small></span></div><Donut value={active} total={subscriptions.length} label={`${active} active`} /></article>
    </section>
    <section className="data-panel">
      <header className="panel-header"><div><h2>Partner subscriptions</h2><span>Unique by User ID + Channel</span></div><div className="table-actions"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm User ID…" /></label><label className="select-field"><SlidersHorizontal size={15} /><select value={channelFilter} onChange={(event) => { setChannelFilter(event.target.value); setPage(1); }}><option>All channels</option>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label></div></header>
      {rows.length ? <div className="table-scroll"><table><thead><tr><th>User ID</th><th>Channel</th><th>Frequency</th><th>Time period</th><th>Created</th><th className="align-right">Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.userId}</strong><small className="cell-sub mono">{item.id.slice(0, 8)}</small></td><td><span className={`channel-label ${item.channel.toLowerCase()}`}>{item.channel}</span></td><td>{item.frequency}</td><td><span className="mono schedule-cell">{item.timePeriod}</span></td><td className="muted">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td><td className="align-right"><div className="status-toggle"><StatusBadge tone={item.enabled ? "success" : "neutral"}>{item.enabled ? "Active" : "Paused"}</StatusBadge><Toggle checked={item.enabled} onChange={() => toggleSubscription(item.id)} label={`${item.userId} status`} /></div></td></tr>)}</tbody></table></div> : <EmptyState icon={<Network size={24} />} title="Chưa có partner phù hợp" copy="Thay đổi bộ lọc hoặc thêm partner subscription mới." action={<button className="button primary" onClick={() => setOpen(true)}><Plus size={16} /> Thêm partner</button>} />}
      <footer className="panel-footer"><span>Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} trong {filtered.length}</span><Pagination page={page} pages={pages} onPage={setPage} /></footer>
    </section>
    <Drawer open={open} onClose={() => setOpen(false)} title="Thêm partner" description="Subscription không thể sửa sau khi tạo; bạn vẫn có thể bật hoặc tắt trạng thái."><form className="drawer-form" onSubmit={submit}><label>Social User ID<input value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} placeholder="@partner-channel" autoFocus /></label><div className="form-grid"><label>Channel<select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value as Platform })}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label><label>Frequency<select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as Frequency })}>{frequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}</select></label></div><label>Time period<input value={form.timePeriod} onChange={(event) => setForm({ ...form, timePeriod: event.target.value })} placeholder="Mon · 12:00–18:00" /></label><div className="callout"><CalendarClock size={18} /><span><b>Scheduling rule</b><small>Daily uses a time range, weekly adds a weekday, and monthly adds a date range. Blank values use system defaults.</small></span></div>{error && <p className="form-error">{error}</p>}<footer><button type="button" className="button secondary" onClick={() => setOpen(false)}>Hủy</button><button className="button primary"><Plus size={16} /> Tạo subscription</button></footer></form></Drawer>
  </>;
}
