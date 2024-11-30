import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { getLanguages, executeCode } from "../utils/api";
import "./ide.scss";

const defaultTemplates = {
  "c++": `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
}`,
  python: `# Write your Python code here`,
  java: `public class Main {
  public static void main(String[] args) {
      // your code here
  }
}`,
  javascript: `// Write your JavaScript code here`,
};

const Ide = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [code, setCode] = useState("// Please select your language above");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [status, setStatus] = useState("");
  const [editorWidth, setEditorWidth] = useState(50);

  const editorRef = useRef(null);
  const resizerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const isResizing = useRef(false);
  const previousLanguageRef = useRef("");

  // Load saved state from sessionStorage
  useEffect(() => {
    const savedCode = sessionStorage.getItem("editorCode");
    const savedLanguage = sessionStorage.getItem("editorLanguage");
    const savedVersion = sessionStorage.getItem("editorVersion");

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      previousLanguageRef.current = savedLanguage;
      setSelectedVersion(savedVersion || "");
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(defaultTemplates[savedLanguage] || "// No template available");
      }
    }
  }, []);

  // Save code to sessionStorage whenever it changes
  useEffect(() => {
    if (code && code !== "// Please select your language above") {
      sessionStorage.setItem("editorCode", code);
    }
  }, [code]);

  // Save language settings
  useEffect(() => {
    if (selectedLanguage) {
      sessionStorage.setItem("editorLanguage", selectedLanguage);
      sessionStorage.setItem("editorVersion", selectedVersion);
    }
  }, [selectedLanguage, selectedVersion]);

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getLanguages();
        const filteredLangs = langs.filter((lang) =>
          ["c++", "python", "java", "javascript"].includes(lang.language)
        );
        setLanguages(filteredLangs);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchLanguages();
  }, []);

  // Updated resizer logic
  useEffect(() => {
    const handleResizerDrag = (e) => {
      if (!isResizing.current) return;

      e.preventDefault();
      if (editorContainerRef.current) {
        const containerRect =
          editorContainerRef.current.parentElement.getBoundingClientRect();
        const newWidth =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Limit the resize range between 30% and 70%
        const clampedWidth = Math.min(Math.max(newWidth, 30), 70);
        setEditorWidth(clampedWidth);
      }
    };

    const stopResizing = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleResizerDrag);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
    };

    const startResizing = (e) => {
      isResizing.current = true;
      document.addEventListener("mousemove", handleResizerDrag);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "ew-resize";
      e.preventDefault();
    };

    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener("mousedown", startResizing);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener("mousedown", startResizing);
      }
      document.removeEventListener("mousemove", handleResizerDrag);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  // Handle language change with template switching
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    const previousLanguage = previousLanguageRef.current;

    // Update the selected language and version
    setSelectedLanguage(newLanguage);
    const langData = languages.find((lang) => lang.language === newLanguage);
    setSelectedVersion(langData?.version || "");

    // Get the current code and the default templates for both languages
    const currentCode = code;
    const oldTemplate = defaultTemplates[previousLanguage] || "";
    const newTemplate =
      defaultTemplates[newLanguage] || "// No template available";

    // If the current code is either the default message or matches the old template,
    // or if it's the first language selection (previousLanguage is empty),
    // then use the new template
    if (
      currentCode === "// Please select your language above" ||
      currentCode === oldTemplate ||
      currentCode === "// No template available" ||
      !previousLanguage
    ) {
      setCode(newTemplate);
      sessionStorage.setItem("editorCode", newTemplate);
    }

    // Update the previous language reference
    previousLanguageRef.current = newLanguage;
  };

  const handleRunCode = async () => {
    if (!selectedLanguage) {
      setOutput("Please select a language to execute the code.");
      setStatus("Error: No language selected.");
      return;
    }

    setLoading(true);
    setStatus("Executing code...");
    setOutput("");

    try {
      const result = await executeCode(
        selectedLanguage,
        selectedVersion,
        code,
        input
      );

      if (result.run.stderr) {
        setOutput(result.run.stderr);
        setStatus("Compilation Error!");
      } else if (result.run.signal === "SIGKILL") {
        setOutput(result.run.stdout);
        setStatus("Time Limit Exceeded!");
      } else if (result.run.stdout) {
        setOutput(result.run.stdout);
        setStatus("Execution successful!");
      } else {
        setOutput("No output.");
        setStatus("Execution successful!");
      }
    } catch (error) {
      setOutput("Error running the code.");
      setStatus("Execution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ide">
      <div className="ide-header">
        <label>
          Language:
          <select value={selectedLanguage} onChange={handleLanguageChange}>
            <option value="" disabled>
              Select Language
            </option>
            {languages.map((lang) => (
              <option key={lang.language} value={lang.language}>
                {lang.language} ({lang.version})
              </option>
            ))}
          </select>
        </label>
        <button
          className="dark-mode-button"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="main-content">
        <div
          className="editor-container"
          ref={editorContainerRef}
          style={{ width: `${editorWidth}%` }}
        >
          <MonacoEditor
            height="100%"
            language={selectedLanguage === "c++" ? "cpp" : selectedLanguage}
            theme={darkMode ? "vs-dark" : "light"}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontFamily: "monospace, Courier New",
              fontSize: 14,
              minimap: { enabled: false },
              tabSize: 4,
              insertSpaces: true,
            }}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.layout(); // Force Monaco editor to relayout
            }}
          />
        </div>

        <div className="resizer" ref={resizerRef}></div>

        <div
          className="io-container"
          style={{ width: `${100 - editorWidth}%` }}
        >
          <textarea
            placeholder="Enter input here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-area"
          />

          <div className="buttons">
            <button onClick={handleRunCode} disabled={loading}>
              {loading ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="status">{status}</div>

          <pre className="output-area">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default Ide;
