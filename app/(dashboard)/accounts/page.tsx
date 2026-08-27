"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Filter, MoreHorizontal, Plus, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import type { AffiliateAccount, Platform } from "@/lib/types";
import { Donut } from "@/components/donut";
import { Drawer, EmptyState, Pagination, StatusBadge, Toggle } from "@/components/ui";

const platforms: Platform[] = ["TikTok", "Facebook", "YouTube"];
const PAGE_SIZE = 6;

function overallHealth(account: AffiliateAccount) {
  return account.gmailHealth === "Inaccessible" || platforms.some((platform) => account.channels[platform].health === "Inaccessible") ? "Bad" : account.provisioningDue ? "Pending" : "Good";
}

export default function AccountsPage() {
  const { accounts, loading, error: storeError, refresh, addAccount, addAccounts, updateAccount, toggleChannel } = useAppStore();
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState("All health");
  const [platformFilter, setPlatformFilter] = useState("All platforms");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<"add" | "edit" | null>(null);
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState<AffiliateAccount | null>(null);
  const [feedback, setFeedback] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const active = accounts.filter((account) => platforms.some((platform) => account.channels[platform].enabled)).length;
  const healthy = accounts.filter((account) => overallHealth(account) === "Good").length;
  const issues = accounts.reduce((total, account) => total + platforms.reduce((sum, platform) => sum + account.channels[platform].issueCount, 0), 0);

  const filtered = useMemo(() => accounts.filter((account) => {
    const matchesText = account.email.toLowerCase().includes(query.toLowerCase()) || platforms.some((platform) => account.channels[platform].userId?.toLowerCase().includes(query.toLowerCase()));
    const matchesHealth = healthFilter === "All health" || overallHealth(account) === healthFilter;
    const matchesPlatform = platformFilter === "All platforms" || Boolean(account.channels[platformFilter as Platform].userId);
    return matchesText && matchesHealth && matchesPlatform;
  }), [accounts, query, healthFilter, platformFilter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitNew = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFeedback("Vui lòng nhập địa chỉ email hợp lệ.");
    if (accounts.some((account) => account.email === email.trim().toLowerCase())) return setFeedback("Email này đã tồn tại trong hệ thống.");
    try {
      await addAccount(email);
      setEmail(""); setFeedback(""); setDrawer(null);
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : "Không thể tạo tài khoản trong Neon.");
    }
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setFeedback("File CSV vượt quá giới hạn 5 MB.");
    const contents = await file.text();
    const count = await addAccounts(contents.split(/[\n,;\r]+/).map((cell) => cell.trim()));
    setFeedback(`Đã nhập ${count} tài khoản mới từ ${file.name}.`);
  };

  const openEdit = (account: AffiliateAccount) => { setEditing(structuredClone(account)); setDrawer("edit"); setFeedback(""); };
  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const original = accounts.find((item) => item.email === editing.email)?.email ?? editing.email;
    try {
      await updateAccount(original, editing); setDrawer(null); setEditing(null);
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : "Không thể lưu thay đổi vào Neon.");
    }
  };

  return (
    <>
      <section className="page-heading">
        <div><span className="kicker">OPERATIONS / ACCOUNTS</span><h1>Tài khoản</h1><p>Quản lý tài khoản affiliate và theo dõi sức khỏe từng kênh.</p></div>
        <div className="heading-actions"><input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(event) => importCsv(event.target.files?.[0])} /><button className="button secondary" onClick={() => fileInput.current?.click()}><FileUp size={17} /> Upload CSV</button><button className="button primary" onClick={() => { setDrawer("add"); setFeedback(""); }}><Plus size={17} /> Thêm tài khoản</button></div>
      </section>

      {feedback && <div className="inline-notice"><CheckCircle2 size={16} />{feedback}<button onClick={() => setFeedback("")}>×</button></div>}
      {storeError && <div className="inline-notice error-notice"><AlertTriangle size={16} />{storeError}<button onClick={() => void refresh()}>Thử lại</button></div>}
      {loading && <div className="loading-line"><span /> Đang tải dữ liệu từ Neon…</div>}

      <section className="metric-grid account-metrics">
        <article className="metric-card featured"><div className="metric-top"><span className="metric-icon"><UsersRound size={20} /></span><span className="trend">+12% tháng này</span></div><div><strong>{accounts.length}</strong><span>Tổng tài khoản</span></div><div className="mini-bars">{[28, 42, 33, 56, 50, 68, 78, 72, 86, 100].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></article>
        <article className="metric-card"><div className="metric-heading"><span><b>Hoạt động</b><small>Ít nhất một kênh đang bật</small></span><span className="legend-dot green" /></div><Donut value={active} total={accounts.length} label={`${active}/${accounts.length}`} /><span className="metric-foot">{accounts.length - active} tài khoản đang tạm dừng</span></article>
        <article className="metric-card"><div className="metric-heading"><span><b>Sức khỏe</b><small>Không có lỗi truy cập</small></span><ShieldCheck size={19} /></div><Donut value={healthy} total={accounts.length} label={`${healthy} good`} color="var(--blue-500)" /><span className="metric-foot">Kiểm tra tiếp theo: Chủ Nhật</span></article>
        <article className="metric-card"><div className="metric-heading"><span><b>Vấn đề</b><small>Cần admin xử lý</small></span><AlertTriangle size={19} /></div><strong className={`issue-number ${issues ? "has-issues" : ""}`}>{issues.toString().padStart(2, "0")}</strong><span className="metric-foot">{issues ? "Kênh lỗi đã tự động tạm dừng" : "Tất cả kênh vận hành bình thường"}</span></article>
      </section>

      <section className="data-panel">
        <header className="panel-header"><div><h2>Danh sách tài khoản</h2><span>{filtered.length} / {accounts.length} records</span></div><div className="table-actions"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm email hoặc social ID…" /></label><label className="select-field"><Filter size={15} /><select value={platformFilter} onChange={(event) => { setPlatformFilter(event.target.value); setPage(1); }}><option>All platforms</option>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label><label className="select-field"><select value={healthFilter} onChange={(event) => { setHealthFilter(event.target.value); setPage(1); }}><option>All health</option><option>Good</option><option>Bad</option><option>Pending</option></select></label></div></header>
        {rows.length ? <div className="table-scroll"><table><thead><tr><th>STT</th><th>Email</th><th>Social IDs</th><th>Health status</th><th>Issues</th><th className="align-right">Status</th><th /></tr></thead><tbody>{rows.map((account, index) => {
          const health = overallHealth(account); const issueCount = platforms.reduce((sum, platform) => sum + account.channels[platform].issueCount, 0);
          return <tr key={account.email}><td className="mono muted">{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</td><td><button className="account-email" onClick={() => openEdit(account)}>{account.email}</button><small className="cell-sub">Added {new Date(account.createdAt).toLocaleDateString("vi-VN")}</small></td><td><div className="platform-stack">{platforms.map((platform) => <span key={platform} className={`platform-chip ${platform.toLowerCase()}`} title={`${platform}: ${account.channels[platform].userId ?? "Pending"}`}>{platform === "TikTok" ? "TK" : platform === "Facebook" ? "FB" : "YT"}<b>{account.channels[platform].userId ? "✓" : "·"}</b></span>)}</div></td><td><StatusBadge tone={health === "Good" ? "success" : health === "Bad" ? "danger" : "warning"}>{health}</StatusBadge></td><td>{issueCount ? <span className="issue-copy"><b>{issueCount} issue{issueCount > 1 ? "s" : ""}</b><small>{platforms.find((platform) => account.channels[platform].issueCount)?.toString()} needs review</small></span> : <span className="muted">None</span>}</td><td className="align-right"><div className="channel-toggles">{platforms.map((platform) => <span key={platform}><small>{platform.slice(0, 2)}</small><Toggle checked={account.channels[platform].enabled} onChange={() => toggleChannel(account.email, platform)} label={`${platform} ${account.email}`} /></span>)}</div></td><td><button className="icon-button compact" onClick={() => openEdit(account)} aria-label={`Sửa ${account.email}`}><MoreHorizontal size={18} /></button></td></tr>;
        })}</tbody></table></div> : <EmptyState icon={<UsersRound size={24} />} title="Không tìm thấy tài khoản" copy="Thử thay đổi bộ lọc hoặc thêm tài khoản affiliate đầu tiên." action={<button className="button primary" onClick={() => setDrawer("add")}><Plus size={16} /> Thêm tài khoản</button>} />}
        <footer className="panel-footer"><span>Hiển thị {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} trong {filtered.length}</span><Pagination page={page} pages={pages} onPage={setPage} /></footer>
      </section>

      <Drawer open={drawer === "add"} onClose={() => setDrawer(null)} title="Thêm tài khoản" description="Tài khoản mới sẽ được xếp hàng provision lúc 22:00 (Asia/Bangkok)."><form className="drawer-form" onSubmit={submitNew}><label>Email affiliate<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="affiliate@hopper.capital" autoFocus required /></label><div className="callout"><ShieldCheck size={18} /><span><b>Quy trình an toàn</b><small>Social account provisioning chỉ chạy qua provider được phê duyệt; mọi CAPTCHA hoặc bước xác minh cần bàn giao cho người vận hành.</small></span></div>{feedback && <p className="form-error">{feedback}</p>}<footer><button type="button" className="button secondary" onClick={() => setDrawer(null)}>Hủy</button><button className="button primary"><Plus size={16} /> Tạo tài khoản</button></footer></form></Drawer>

      <Drawer open={drawer === "edit" && Boolean(editing)} onClose={() => setDrawer(null)} title="Chỉnh sửa tài khoản" description="Cập nhật social ID và trạng thái kết nối đã xác minh.">{editing && <form className="drawer-form" onSubmit={saveEdit}><label>Email<input value={editing.email} disabled /></label>{platforms.map((platform) => <fieldset key={platform}><legend>{platform}</legend><label>User ID<input value={editing.channels[platform].userId ?? ""} onChange={(event) => setEditing({ ...editing, channels: { ...editing.channels, [platform]: { ...editing.channels[platform], userId: event.target.value || null } } })} placeholder={`@${platform.toLowerCase()}-user`} /></label><label className="inline-check"><input type="checkbox" checked={editing.channels[platform].enabled} onChange={(event) => setEditing({ ...editing, channels: { ...editing.channels, [platform]: { ...editing.channels[platform], enabled: event.target.checked } } })} /> Cho phép automation</label></fieldset>)}<footer><button type="button" className="button secondary" onClick={() => setDrawer(null)}>Hủy</button><button className="button primary">Lưu thay đổi</button></footer></form>}</Drawer>
    </>
  );
}
