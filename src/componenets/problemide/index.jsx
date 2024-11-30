import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // Add this import
import MonacoEditor from "@monaco-editor/react";
import { getLanguages, executeCode } from "../utils/api";
import "./problemide.scss";

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

const ProblemIde = ({ inputExamples, outputExamples }) => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [code, setCode] = useState("// Please select your language above");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [editorHeight, setEditorHeight] = useState(65); // Default 60% height for editor
  const [currentTestCase, setCurrentTestCase] = useState(0);
  const [exampleOutput, setExampleOutput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [activeTab, setActiveTab] = useState("example"); // 'example' or 'custom'
  const [exampleStatus, setExampleStatus] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const [executedSuccessfully, setExecutedSuccessfully] = useState(false);

  const editorRef = useRef(null);
  const resizerRef = useRef(null);
  // const editorMainRef = useRef(null);
  const editorContainerRef = useRef(null);
  const isResizing = useRef(false);
  const previousLanguageRef = useRef("");
  // Function to handle test case selection
  const handleTestCaseChange = (index) => {
    setCurrentTestCase(index);
    setInput(inputExamples[index]);
  };

  // Function to run all test cases
  // const runAllTestCases = async () => {
  //   setLoading(true);
  //   setStatus("Running all test cases...");
  //   const results = [];

  //   for (let i = 0; i < inputExamples.length; i++) {
  //     try {
  //       // Add your code execution logic here
  //       // const response = await executeCode(code, inputExamples[i], selectedLanguage);
  //       // const passed = response.output.trim() === outputExamples[i].trim();
  //       const passed = false; // Replace with actual comparison
  //       results.push({
  //         testCase: i + 1,
  //         passed,
  //         expected: outputExamples[i],
  //         actual: "actual output", // Replace with actual output
  //       });
  //     } catch (error) {
  //       results.push({
  //         testCase: i + 1,
  //         passed: false,
  //         error: error.message,
  //       });
  //     }
  //   }

  //   setTestResults(results);
  //   setLoading(false);
  //   setStatus("All test cases completed");
  // };

  // Add this at the top of your component
  const location = useLocation(); // Import useLocation from react-router-dom
  const problemId = location.pathname; // Or however you're getting the problem ID

  // Load saved state from sessionStorage
  useEffect(() => {
    const savedCode = sessionStorage.getItem(`${problemId}_editorCode`);
    const savedLanguage = sessionStorage.getItem(`${problemId}_editorLanguage`);
    const savedVersion = sessionStorage.getItem(`${problemId}_editorVersion`);

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      previousLanguageRef.current = savedLanguage;
      setSelectedVersion(savedVersion || "");
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(defaultTemplates[savedLanguage] || "// No template available");
      }
    } else {
      // Reset states when problem changes
      setCode("// Please select your language above");
      setSelectedLanguage("");
      setSelectedVersion("");
      previousLanguageRef.current = "";
    }
  }, [problemId]); // Add problemId to dependencies

  // Save code to sessionStorage whenever it changes
  useEffect(() => {
    if (code && code !== "// Please select your language above") {
      sessionStorage.setItem(`${problemId}_editorCode`, code);
    }
  }, [code, problemId]);

  // Save language settings
  useEffect(() => {
    if (selectedLanguage) {
      sessionStorage.setItem(`${problemId}_editorLanguage`, selectedLanguage);
      sessionStorage.setItem(`${problemId}_editorVersion`, selectedVersion);
    }
  }, [selectedLanguage, selectedVersion, problemId]);

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

      const editorMain = editorContainerRef.current?.parentElement;
      if (!editorMain) return;

      const containerRect = editorMain.getBoundingClientRect();
      const containerHeight = containerRect.height;

      // Calculate the relative mouse position within the container
      const relativeY = Math.max(
        0,
        Math.min(e.clientY - containerRect.top, containerHeight)
      );

      // Calculate percentage with bounds checking
      const percentage = (relativeY / containerHeight) * 100;

      // Clamp the height between 20% and 80%
      const clampedHeight = Math.min(Math.max(percentage, 20), 80);

      // Update editor height
      setEditorHeight(clampedHeight);

      // Prevent text selection during resize
      e.preventDefault();
    };

    const stopResizing = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleResizerDrag);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";

      // Ensure editor relayouts after resize
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current.layout();
        }, 0);
      }
    };

    const startResizing = (e) => {
      isResizing.current = true;
      document.addEventListener("mousemove", handleResizerDrag);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "row-resize";
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

  // Add this effect to handle editor layout updates
  useEffect(() => {
    if (editorRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        editorRef.current.layout();
      });

      const editorContainer = editorContainerRef.current;
      if (editorContainer) {
        resizeObserver.observe(editorContainer);
      }

      return () => {
        if (editorContainer) {
          resizeObserver.unobserve(editorContainer);
        }
      };
    }
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
    setExecutedSuccessfully(false);
    
    if (!selectedLanguage) {
      const errorMessage = "Please select a language to execute the code.";
      if (activeTab === "example") {
        setExampleStatus(errorMessage);
      } else {
        setCustomStatus(errorMessage);
      }
      return;
    }

    // Clear previous outputs
    if (activeTab === "example") {
      setExampleOutput("");
    } else {
      setCustomOutput("");
    }

    // Set status for the active tab
    setLoading(true);
    if (activeTab === "example") {
      setExampleStatus("Executing code...");
    } else {
      setCustomStatus("Executing code...");
    }

    try {
      const inputToUse = activeTab === "example" 
        ? inputExamples[currentTestCase] 
        : input;

      const result = await executeCode(
        selectedLanguage,
        selectedVersion,
        code,
        inputToUse
      );

      let newStatus = "";
      let executionOutput = "";

      if (result.run.stderr) {
        newStatus = "Compilation Error!";
        executionOutput = result.run.stderr;
      } else if (result.run.signal === "SIGKILL") {
        newStatus = "Time Limit Exceeded!";
      } else if (result.run.stdout) {
        newStatus = "Execution successful!";
        executionOutput = result.run.stdout;
        setExecutedSuccessfully(true);
      } else {
        newStatus = "No output.";
      }

      // Set output based on active tab
      if (activeTab === "example") {
        setExampleStatus(newStatus);
        setExampleOutput(executionOutput);
      } else {
        setCustomStatus(newStatus);
        setCustomOutput(executionOutput);
      }
    } catch (error) {
      const errorMessage = "Execution failed. Please try again.";
      if (activeTab === "example") {
        setExampleStatus(errorMessage);
        setExampleOutput("");
      } else {
        setCustomStatus(errorMessage);
        setCustomOutput("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
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
          className="theme-toggle-button"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="editor-main">
        <div
          ref={editorContainerRef}
          className="editor-container"
          style={{
            height: `${editorHeight}%`,
            minHeight: "20%",
            maxHeight: "80%",
          }}
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
              scrollBeyondLastLine: false,
            }}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.layout();
            }}
          />
        </div>

        <div ref={resizerRef} className="resizer" />

        <div className="bottom-section">
          <div className="testcase-header">
            <div className="testcase-tabs">
              <button
                className={`tab-button ${activeTab === "example" ? "active" : ""}`}
                onClick={() => setActiveTab("example")}
              >
                Example Testcases
              </button>
              <button
                className={`tab-button ${activeTab === "custom" ? "active" : ""}`}
                onClick={() => setActiveTab("custom")}
              >
                Custom Testcase
              </button>
            </div>
            <button
              className="run-button"
              onClick={handleRunCode}
              disabled={loading}
            >
              {loading ? "Running..." : "Run Code"}
            </button>
          </div>

          {activeTab === "example" ? (
            <div className="example-testcases">
              {exampleStatus && (
                <div
                  className={`status-message ${exampleStatus.includes("error") ? "error" : "success"}`}
                >
                  {!executedSuccessfully && <div>{exampleStatus}</div>}

                  {executedSuccessfully && <div className="verdict-section">
                    <div
                      className={`verdict ${
                        exampleOutput.trim() ===
                        outputExamples[currentTestCase].trim()
                          ? "accepted"
                          : "wrong"
                      }`}
                    >
                      {exampleOutput.trim() ===
                      outputExamples[currentTestCase].trim()
                        ? "Correct"
                        : "Wrong"}
                    </div>
                  </div>}
                </div>
              )}
              <div className="test-cases-selector">
                <select
                  value={currentTestCase}
                  onChange={(e) => handleTestCaseChange(Number(e.target.value))}
                >
                  {inputExamples.map((_, index) => (
                    <option key={index} value={index}>
                      Test Case {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="testcase-content">
                <div className="input-section">
                  <div className="section-header">Input:</div>
                  <pre className="content">
                    {inputExamples[currentTestCase]}
                  </pre>
                </div>
                <div className="output-section">
                  <div className="section-header">Expected Output:</div>
                  <pre className="content">
                    {outputExamples[currentTestCase]}
                  </pre>
                </div>

                <div className="output-section">
                  <div className="section-header">Your Output:</div>
                  <pre className="content">{exampleOutput}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="custom-testcase">
              {customStatus && (
                <div className="status-message">{customStatus}</div>
              )}
              <div className="input-section">
                <div className="section-header">Custom Input:</div>
                <textarea
                  placeholder="Enter your custom input..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="output-section">
                <div className="section-header">Custom Output:</div>
                <pre className="output-content">{customOutput}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemIde;
