/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";

type ColorStyle = "zinc" | "blue" | "green" | "red" | "orange";

const DEFAULT_COLOR: ColorStyle = "zinc";
const COLOR_COOKIE_NAME = "vite-ui-color";
const COLOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ColorProviderState = {
  color: ColorStyle;
  setColor: (color: ColorStyle) => void;
  resetColor: () => void;
};

const ColorContext = createContext<ColorProviderState | undefined>(undefined);

export function ColorProvider({
  children,
  defaultColor = DEFAULT_COLOR,
  storageKey = COLOR_COOKIE_NAME,
}: {
  children: React.ReactNode;
  defaultColor?: ColorStyle;
  storageKey?: string;
}) {
  const [color, _setColor] = useState<ColorStyle>(defaultColor);

  useEffect(() => {
    const savedColor = getCookie(storageKey) as ColorStyle | undefined;
    if (savedColor) _setColor(savedColor);
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyColor = (c: ColorStyle) => {
      // Remove any existing theme-* classes
      root.classList.forEach((cls) => {
        if (cls.startsWith("theme-")) {
          root.classList.remove(cls);
        }
      });
      // Add the new theme class if not default (zinc is default, but we can add theme-zinc)
      root.classList.add(`theme-${c}`);
    };

    applyColor(color);
  }, [color]);

  const setColor = (newColor: ColorStyle) => {
    setCookie(storageKey, newColor, COLOR_COOKIE_MAX_AGE);
    _setColor(newColor);
  };

  const resetColor = () => {
    removeCookie(storageKey);
    _setColor(DEFAULT_COLOR);
  };

  const contextValue: ColorProviderState = {
    color,
    setColor,
    resetColor,
  };

  return (
    <ColorContext.Provider value={contextValue}>
      {children}
    </ColorContext.Provider>
  );
}

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) throw new Error("useColor must be used within ColorProvider");
  return context;
};
