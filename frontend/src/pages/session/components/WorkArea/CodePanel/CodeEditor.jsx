// session/components/WorkArea/CodePanel/CodeEditor.jsx
import React, { useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useSettings } from "../../../context/SettingsContext";
import useCollabEditor from "../../../hooks/useCollabEditor";

const CodeEditor = ({ sessionId }) => {
  const { settings } = useSettings();
  const { theme, language, fontSize, wordWrap, minimap } = settings.editor;

  // collab hook (gives us onMount to wire live-deltas)
  const { onMount: collabOnMount } = useCollabEditor(sessionId);

  // keep refs to editor + monaco so we can update after mount
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // mount handler: save refs, apply initial options, wire collab hook
  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // initial theme/options
      monaco.editor.setTheme(theme);
      editor.updateOptions({
        fontSize,
        wordWrap,
        minimap: { enabled: minimap },
        automaticLayout: true, // keep it responsive
      });

      // initial language for the current model
      const model = editor.getModel?.();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }

      // wire collaborative deltas
      collabOnMount(editor, monaco);
    },
    [theme, fontSize, wordWrap, minimap, language, collabOnMount]
  );

  // react to theme changes live
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(theme);
  }, [theme]);

  // react to options changes live
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({
      fontSize,
      wordWrap,
      minimap: { enabled: minimap },
    });
  }, [fontSize, wordWrap, minimap]);

  // react to language changes live
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel?.();
    if (model) {
      monacoRef.current.editor.setModelLanguage(model, language);
    }
  }, [language]);

  return (
    <Editor
      height="100%"
      theme={theme}
      language={language}
      onMount={handleMount}
      options={{
        fontSize,
        wordWrap,
        minimap: { enabled: minimap },
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;
