// session/context/SettingsContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";

const DEFAULTS = {
  editor: {
    theme: "vs-dark",
    language: "javascript",
    fontSize: 14,
    wordWrap: "off", // "off" | "on" | "bounded" | "wordWrapColumn"
    minimap: true,
  },
  sketch: {
    bgColor: "#ffffff",
    showGrid: false,
    gridSize: 16,
  },
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children, sessionId }) => {
  const storageKey = useMemo(
    () => `thinkroom:settings${sessionId ? `:session:${sessionId}` : ""}`,
    [sessionId]
  );

  // Load once from localStorage; deep-merge with DEFAULTS to survive additions
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULTS,
          ...parsed,
          editor: { ...DEFAULTS.editor, ...(parsed.editor || {}) },
          sketch: { ...DEFAULTS.sketch, ...(parsed.sketch || {}) },
        };
      }
    } catch {}
    return { ...DEFAULTS };
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {}
  }, [settings, storageKey]);

  // Partial setters (shape matches your components)
  const setEditor = useCallback((partial) => {
    setSettings((prev) => ({
      ...prev,
      editor: { ...prev.editor, ...partial },
    }));
  }, []);

  const setSketch = useCallback((partial) => {
    setSettings((prev) => ({
      ...prev,
      sketch: { ...prev.sketch, ...partial },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS });
  }, []);

  const value = useMemo(
    () => ({ settings, setEditor, setSketch, resetSettings }),
    [settings, setEditor, setSketch, resetSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
};
