"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AffiliateAccount, InteractionLog, Platform, Subscription } from "./types";

interface AppStoreValue {
  accounts: AffiliateAccount[];
  subscriptions: Subscription[];
  history: InteractionLog[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addAccount: (email: string) => Promise<void>;
  addAccounts: (emails: string[]) => Promise<number>;
  updateAccount: (originalEmail: string, account: AffiliateAccount) => Promise<void>;
  toggleChannel: (email: string, platform: Platform) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, "id" | "createdAt">) => Promise<void>;
  toggleSubscription: (id: string) => Promise<void>;
}

const AppStore = createContext<AppStoreValue | null>(null);

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AffiliateAccount[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [history, setHistory] = useState<InteractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [accountData, subscriptionData, historyData] = await Promise.all([
        fetch("/api/accounts", { cache: "no-store" }).then((response) => readJson<AffiliateAccount[]>(response)),
        fetch("/api/subscriptions", { cache: "no-store" }).then((response) => readJson<Subscription[]>(response)),
        fetch("/api/history?limit=500", { cache: "no-store" }).then((response) => readJson<InteractionLog[]>(response)),
      ]);
      setAccounts(accountData);
      setSubscriptions(subscriptionData);
      setHistory(historyData);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load Neon data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(request);
  }, [refresh]);

  const addAccount = useCallback(async (email: string) => {
    const account = await fetch("/api/accounts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase() }) }).then((response) => readJson<AffiliateAccount>(response));
    setAccounts((current) => [account, ...current]);
  }, []);

  const addAccounts = useCallback(async (emails: string[]) => {
    const valid = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
    const existing = new Set(accounts.map((account) => account.email));
    const incoming = valid.filter((email) => !existing.has(email));
    const results = await Promise.allSettled(incoming.map(addAccount));
    return results.filter((result) => result.status === "fulfilled").length;
  }, [accounts, addAccount]);

  const updateAccount = useCallback(async (originalEmail: string, account: AffiliateAccount) => {
    const updated = await fetch(`/api/accounts/${encodeURIComponent(originalEmail)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(account) }).then((response) => readJson<AffiliateAccount>(response));
    setAccounts((current) => current.map((item) => item.email === originalEmail ? updated : item));
  }, []);

  const toggleChannel = useCallback(async (email: string, platform: Platform) => {
    const account = accounts.find((item) => item.email === email);
    if (!account || !account.channels[platform].userId) return;
    const updatedAccount = { ...account, channels: { ...account.channels, [platform]: { ...account.channels[platform], enabled: !account.channels[platform].enabled } } };
    setAccounts((current) => current.map((item) => item.email === email ? updatedAccount : item));
    try {
      await updateAccount(email, updatedAccount);
    } catch (cause) {
      setAccounts((current) => current.map((item) => item.email === email ? account : item));
      setError(cause instanceof Error ? cause.message : "Unable to update channel");
    }
  }, [accounts, updateAccount]);

  const addSubscription = useCallback(async (subscription: Omit<Subscription, "id" | "createdAt">) => {
    const created = await fetch("/api/subscriptions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(subscription) }).then((response) => readJson<Subscription>(response));
    setSubscriptions((current) => [created, ...current]);
  }, []);

  const toggleSubscription = useCallback(async (id: string) => {
    const item = subscriptions.find((subscription) => subscription.id === id);
    if (!item) return;
    const optimistic = { ...item, enabled: !item.enabled };
    setSubscriptions((current) => current.map((subscription) => subscription.id === id ? optimistic : subscription));
    try {
      const updated = await fetch("/api/subscriptions/status", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: item.userId, channel: item.channel, status: !item.enabled }) }).then((response) => readJson<Subscription>(response));
      setSubscriptions((current) => current.map((subscription) => subscription.id === id ? updated : subscription));
    } catch (cause) {
      setSubscriptions((current) => current.map((subscription) => subscription.id === id ? item : subscription));
      setError(cause instanceof Error ? cause.message : "Unable to update subscription");
    }
  }, [subscriptions]);

  const value = useMemo(() => ({ accounts, subscriptions, history, loading, error, refresh, addAccount, addAccounts, updateAccount, toggleChannel, addSubscription, toggleSubscription }), [accounts, subscriptions, history, loading, error, refresh, addAccount, addAccounts, updateAccount, toggleChannel, addSubscription, toggleSubscription]);
  return <AppStore.Provider value={value}>{children}</AppStore.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStore);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
