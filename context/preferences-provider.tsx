"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Language = "id" | "en" | "en-gb";
export type DateFormat =
  | "dd/MM/yyyy"
  | "MM/dd/yyyy"
  | "yyyy-MM-dd"
  | "d MMMM yyyy";
export type TimeFormat = "24h" | "12h";

export type NotificationSettings = {
  // In-app
  assetUpdate: boolean;
  maintenance: boolean;
  loan: boolean;
  transfer: boolean;
  system: boolean;
  // Email
  emailSummary: boolean;
  emailAlert: boolean;
  emailReport: boolean;
  // Push
  pushEnabled: boolean;
};

export type PreferencesState = {
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  notifications: NotificationSettings;
  setLanguage: (v: Language) => void;
  setDateFormat: (v: DateFormat) => void;
  setTimeFormat: (v: TimeFormat) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  resetPreferences: () => void;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_LANGUAGE: Language = "id";
const DEFAULT_DATE_FORMAT: DateFormat = "dd/MM/yyyy";
const DEFAULT_TIME_FORMAT: TimeFormat = "24h";

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  assetUpdate: true,
  maintenance: true,
  loan: true,
  transfer: false,
  system: true,
  emailSummary: true,
  emailAlert: true,
  emailReport: false,
  pushEnabled: false,
};

// ─── Cookie keys ──────────────────────────────────────────────────────────────
const COOKIE_LANGUAGE = "pref_language";
const COOKIE_DATE_FORMAT = "pref_date_format";
const COOKIE_TIME_FORMAT = "pref_time_format";
const COOKIE_NOTIFICATIONS = "pref_notifications";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// ─── Context ──────────────────────────────────────────────────────────────────
const PreferencesContext = createContext<PreferencesState | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSavedNotifications(): NotificationSettings {
  const raw = getCookie(COOKIE_NOTIFICATIONS);
  if (!raw) return DEFAULT_NOTIFICATIONS;
  try {
    return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(decodeURIComponent(raw)) };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function initializeLanguage(): Language {
  const lang = getCookie(COOKIE_LANGUAGE) as Language | undefined;
  return lang || DEFAULT_LANGUAGE;
}

function initializeDateFormat(): DateFormat {
  const df = getCookie(COOKIE_DATE_FORMAT) as DateFormat | undefined;
  return df || DEFAULT_DATE_FORMAT;
}

function initializeTimeFormat(): TimeFormat {
  const tf = getCookie(COOKIE_TIME_FORMAT) as TimeFormat | undefined;
  return tf || DEFAULT_TIME_FORMAT;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, _setLanguage] = useState<Language>(initializeLanguage);
  const [dateFormat, _setDateFormat] =
    useState<DateFormat>(initializeDateFormat);
  const [timeFormat, _setTimeFormat] =
    useState<TimeFormat>(initializeTimeFormat);
  const [notifications, _setNotifications] = useState<NotificationSettings>(
    getSavedNotifications,
  );

  // Apply language to <html lang="...">
  useEffect(() => {
    document.documentElement.lang = language === "en-gb" ? "en" : language;
  }, [language]);

  const setLanguage = (v: Language) => {
    setCookie(COOKIE_LANGUAGE, v, COOKIE_MAX_AGE);
    _setLanguage(v);
  };

  const setDateFormat = (v: DateFormat) => {
    setCookie(COOKIE_DATE_FORMAT, v, COOKIE_MAX_AGE);
    _setDateFormat(v);
  };

  const setTimeFormat = (v: TimeFormat) => {
    setCookie(COOKIE_TIME_FORMAT, v, COOKIE_MAX_AGE);
    _setTimeFormat(v);
  };

  const setNotification = (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    _setNotifications(updated);
    setCookie(
      COOKIE_NOTIFICATIONS,
      encodeURIComponent(JSON.stringify(updated)),
      COOKIE_MAX_AGE,
    );
  };

  const resetPreferences = () => {
    removeCookie(COOKIE_LANGUAGE);
    removeCookie(COOKIE_DATE_FORMAT);
    removeCookie(COOKIE_TIME_FORMAT);
    removeCookie(COOKIE_NOTIFICATIONS);
    _setLanguage(DEFAULT_LANGUAGE);
    _setDateFormat(DEFAULT_DATE_FORMAT);
    _setTimeFormat(DEFAULT_TIME_FORMAT);
    _setNotifications(DEFAULT_NOTIFICATIONS);
  };

  return (
    <PreferencesContext
      value={{
        language,
        dateFormat,
        timeFormat,
        notifications,
        setLanguage,
        setDateFormat,
        setTimeFormat,
        setNotification,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
}
