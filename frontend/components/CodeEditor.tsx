'use client';

import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

interface CodeEditorProps {
    initialCode?: string;
    value?: string;
    onChange?: (value: string) => void;
    height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialCode = '// Write C++ code here...',
    value,
    onChange,
    height = '400px',
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isFlexFill = height === '100%';

    if (!mounted) {
        return (
            <div
                className="w-full bg-[#1e1e1e] text-white/50 flex items-center justify-center rounded-md"
                style={isFlexFill ? { flex: 1, minHeight: 0 } : { height }}
            >
                Loading Editor...
            </div>
        );
    }

    return (
        <div
            className="w-full border border-gray-700 rounded-md overflow-hidden"
            dir="ltr"
            style={isFlexFill
                ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, direction: 'ltr', textAlign: 'left' }
                : { height, direction: 'ltr', textAlign: 'left' }
            }
        >
            <CodeMirror
                value={value ?? initialCode}
                height={isFlexFill ? '100%' : height}
                style={isFlexFill ? { flex: 1, minHeight: 0, overflow: 'auto' } : undefined}
                theme={vscodeDark}
                extensions={[cpp()]}
                onChange={(val) => onChange && onChange(val)}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    autocompletion: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    indentOnInput: true,
                    tabSize: 4,
                }}
            />
        </div>
    );
};

export default CodeEditor;
