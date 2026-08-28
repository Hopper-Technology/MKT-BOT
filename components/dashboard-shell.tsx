"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronDown, CircleUserRound, History, LayoutDashboard, LogOut, Menu, Network, Search, ShieldCheck, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/app/(dashboard)/actions";

const navItems = [
  { href: "/accounts", label: "Tài khoản", caption: "Accounts", icon: UsersRound },
  { href: "/subscriptions", label: "Subscription", caption: "Partner network", icon: Network },
  { href: "/history", label: "Lịch sử", caption: "Interaction logs", icon: History },
  { href: "/system", label: "Hệ thống", caption: "Architecture", icon: LayoutDashboard },
];

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AU";
}

export function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = navItems.find((item) => pathname.startsWith(item.href)) ?? navItems[0];
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Admin User";
  const displayEmail = user?.email || "admin@hopper.capital";
  const initials = getInitials(displayName);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><span>H</span></span>
          <span><strong>Hopper SE</strong><small>Automation Admin</small></span>
        </div>
        <button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X size={20} /></button>
        <nav className="side-nav" aria-label="Điều hướng chính">
          <span className="nav-eyebrow">Workspace</span>
          {navItems.map(({ href, label, caption, icon: Icon }) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""} onClick={() => setMenuOpen(false)}>
              <Icon size={19} strokeWidth={1.8} />
              <span><b>{label}</b><small>{caption}</small></span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-status">
          <span className="live-dot" />
          <span><b>Automation online</b><small>6 scheduled jobs</small></span>
        </div>
        <div className="sidebar-user">
          {user?.image ? <Image className="avatar avatar-image" src={user.image} alt="" width={34} height={34} /> : <span className="avatar">{initials}</span>}
          <span><b>{displayName}</b><small>{displayEmail}</small></span>
          <form action={signOutAction}><button className="logout-button" type="submit" aria-label="Đăng xuất"><LogOut size={18} /></button></form>
        </div>
      </aside>
      {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" />}
      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Marketing Automation</span><b>/</b><strong>{active.label}</strong></div>
          <label className="global-search">
            <Search size={17} />
            <input placeholder="Search workspace…" aria-label="Search workspace" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button className="icon-button" aria-label="Lịch"><CalendarDays size={19} /></button>
            <button className="icon-button notification" aria-label="Thông báo"><Bell size={19} /><i /></button>
            <button className="icon-button" aria-label="Bảo mật"><ShieldCheck size={19} /></button>
            <button className="profile-button" title={displayEmail} aria-label={`Tài khoản ${displayName}`}>
              {user?.image ? <Image className="profile-avatar" src={user.image} alt="" width={26} height={26} /> : <span className="profile-avatar profile-avatar-fallback"><CircleUserRound size={24} /></span>}
              <span>{displayName}</span><ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
