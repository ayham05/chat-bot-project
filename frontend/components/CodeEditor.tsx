import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    initialCode?: string;
    value?: string;
    onChange?: (value: string) => void;
    height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialCode = "// Write C++ code here...",
    value,
    onChange,
    height = "400px"
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-64 w-full bg-gray-900 text-white flex items-center justify-center">Loading Editor...</div>;
    }

    return (
        <div className="w-full border border-gray-700 rounded-md overflow-hidden" style={{ height }}>
            <Editor
                height="100%"
                defaultLanguage="cpp"
                defaultValue={initialCode}
                value={value}
                theme="vs-dark"
                onChange={(val) => onChange && onChange(val || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
