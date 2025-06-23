import Editor from "@monaco-editor/react";
import React, { useRef, useState } from "react";

interface Props {
    code: string;
    language: string;
    setCode: React.Dispatch<React.SetStateAction<string>>;
}

const CodeEditor: React.FC<Props> = ({ code, language = 'python', setCode }) => {
    const editorRef = useRef(null);
    const [pasteWarning, setPasteWarning] = useState("");

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        // Block paste and show warning
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
            showPasteWarning();
        });

        // Block copy and cut (optional)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => { });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => { });

        // Disable context menu
        editor.updateOptions({ contextmenu: false });

        editor.onMouseDown((e: any) => {
            if (e.event.rightButton) {
                e.event.preventDefault();
                e.event.stopPropagation();
                showPasteWarning();
            }
        });
    };

    const showPasteWarning = () => {
        setPasteWarning("⚠️ Pasting is disabled in this coding environment.");
        setTimeout(() => setPasteWarning(""), 3000);
    };

    return (
        <div>
            <Editor
                height="400px"
                defaultLanguage={language}
                value={code}
                onChange={(value) => setCode(value as string)}
                theme="vs-dark"
                onMount={handleEditorDidMount}
            />
            {pasteWarning && (
                <div style={{ color: "orange", marginTop: "8px" }}>{pasteWarning}</div>
            )}
        </div>
    );
}

export default CodeEditor;
