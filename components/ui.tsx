"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" className={`toggle ${checked ? "on" : ""}`} onClick={onChange} role="switch" aria-checked={checked} aria-label={label}><span /></button>;
}

export function StatusBadge({ tone, children }: { tone: "success" | "danger" | "warning" | "neutral" | "info"; children: React.ReactNode }) {
  return <span className={`status-badge ${tone}`}>{tone === "success" && <Check size={12} />}{children}</span>;
}

export function Drawer({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-layer" role="presentation">
      <button className="drawer-scrim" onClick={onClose} aria-label="Đóng" />
      <section className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header><div><span className="kicker">MKT-BOT</span><h2 id="drawer-title">{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={20} /></button></header>
        {children}
      </section>
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return <nav className="pagination" aria-label="Phân trang"><button disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button>{Array.from({ length: pages }, (_, index) => index + 1).map((item) => <button key={item} className={item === page ? "active" : ""} onClick={() => onPage(item)}>{item}</button>)}<button disabled={page === pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button></nav>;
}

export function EmptyState({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{copy}</p>{action}</div>;
}
