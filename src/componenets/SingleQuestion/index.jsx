import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import logo from "../../assets/logo-header.png";
import "./style.scss";
import ProblemIde from "../problemide";

const cleanMathJaxContent = (html) => {
  if (!html) return html;

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Remove MathJax_Preview elements
  temp.querySelectorAll(".MathJax_Preview").forEach((el) => el.remove());

  // Remove existing MathJax elements but keep the original math content
  temp.querySelectorAll(".MathJax").forEach((el) => el.remove());

  // Handle both inline and display math scripts
  temp
    .querySelectorAll(
      'script[type="math/tex"], script[type="math/tex; mode=display"]'
    )
    .forEach((script) => {
      const mathText = script.textContent || script.text;
      const span = document.createElement("span");
      const isDisplay = script.getAttribute("type").includes("mode=display");
      span.textContent = isDisplay ? `\\[${mathText}\\]` : `\\(${mathText}\\)`;
      script.parentNode.replaceChild(span, script);
    });

  return temp.innerHTML;
};

// Enhanced MathJax configuration
const configureMathJax = () => {
  window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
      processEnvironments: true,
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
      processHtmlClass: "tex2jax_process",
    },
    startup: {
      pageReady: () => {
        return window.MathJax.startup.defaultPageReady().then(() => {
          document.querySelectorAll(".MathJax_Preview").forEach((el) => {
            el.style.display = "none";
          });
        });
      },
    },
  };
};

// Enhanced typeset function with retry mechanism
const typesetMathJax = (retries = 3) => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetClear();
        window.MathJax.typesetPromise()
          .then(resolve)
          .catch((error) => {
            console.error("MathJax typeset error:", error);
            if (retriesLeft > 0) {
              setTimeout(() => attempt(retriesLeft - 1), 500);
            } else {
              reject(error);
            }
          });
      } else if (retriesLeft > 0) {
        setTimeout(() => attempt(retriesLeft - 1), 500);
      } else {
        reject(new Error("MathJax not available"));
      }
    };
    attempt(retries);
  });
};

const SingleQuestion = () => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftWidth, setLeftWidth] = useState(45);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);
  const containerRef = useRef(null);
  const { contestId, problemId } = useParams();

  useEffect(() => {
    const loadMathJax = async () => {
      if (window.MathJax) {
        setMathJaxLoaded(true);
        return;
      }

      configureMathJax();

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
        script.async = true;
        script.id = "MathJax-script";

        script.onload = () => {
          setMathJaxLoaded(true);
          resolve();
        };
        script.onerror = reject;

        document.head.appendChild(script);
      });
    };

    loadMathJax().catch((err) => {
      console.error("Failed to load MathJax:", err);
      setError("MathJax failed to load.");
    });

    return () => {
      const mathJaxScript = document.getElementById("MathJax-script");
      if (mathJaxScript) {
        document.head.removeChild(mathJaxScript);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(
          `https://codaddy-back.vercel.app/api/problem/${contestId}/${problemId}`
        );

        if (!response.ok) {
          throw new Error("Problem fetching failed");
        }

        const data = await response.json();

        // Clean MathJax content and replace image URLs
        const processedData = {
          ...data,
          problemStatement: cleanMathJaxContent(
            replaceImageUrls(data.problemStatement)
          ),
          inputSpecification: cleanMathJaxContent(
            replaceImageUrls(data.inputSpecification)
          ),
          outputSpecification: cleanMathJaxContent(
            replaceImageUrls(data.outputSpecification)
          ),
          note: cleanMathJaxContent(replaceImageUrls(data.note)),
        };

        if (processedData.outputSpecification === "") {
          processedData.outputSpecification =
            "This is an interactive problem, interaction technique is provided above";
        }

        setProblem(processedData);
        setLoading(false);

        // Wait for next frame and typeset
        requestAnimationFrame(async () => {
          try {
            await typesetMathJax();
          } catch (error) {
            console.error("Failed to typeset MathJax:", error);
          }
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (mathJaxLoaded) {
      fetchProblem();
    }
  }, [contestId, problemId, mathJaxLoaded]);

  const replaceImageUrls = (html) => {
    if (!html) return html;

    return html.replace(
      /<img[^>]*src=["']([^"']+)["'][^>]*\/?>/g,
      (imgTag, src) => {
        let newImgTag = imgTag;
        if (src.startsWith("http") && !src.includes("proxy-image")) {
          const proxyUrl = `https://codaddy-back.vercel.app/proxy-image?url=${encodeURIComponent(src)}`;
          newImgTag = imgTag.replace(src, proxyUrl);
        }
        if (!newImgTag.endsWith("/>") && !newImgTag.endsWith(">")) {
          newImgTag += ">";
        }
        return `${newImgTag}</br>`;
      }
    );
  };

  const handleMouseDown = (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const container = containerRef.current;
    const singleQuestion = container.querySelector(".single-question");
    const containerWidth = container.offsetWidth;
    const startWidth = singleQuestion.offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPercentage = ((startWidth + deltaX) / containerWidth) * 100;
      const constrainedWidth = Math.max(30, Math.min(70, newWidthPercentage));
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (error)
    return (
      <div className="error-container">
        Error: failed to load the problem, please refresh the page or report it
        to iamwizardaddy@gmail.com. {error}
      </div>
    );

  return (
    <div className="single-question-page">
      <div className="single-question-ide-container" ref={containerRef}>
        {loading && <LoadingSpinner />}

        {!loading && problem && (
          <>
            <div className="single-question" style={{ width: `${leftWidth}%` }}>
              <div className="problem-header">
                <div
                  className="logo-container"
                  onClick={() => (window.location.href = "/")}
                >
                  <img src={logo} alt="Codaddy" />
                </div>
                <div
                  className="submit"
                  onClick={() =>
                    window.open(
                      `https://codeforces.com/problemset/submit`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  Submit
                </div>
              </div>

              <h1 className="problem-title">
                {contestId}
                {problem.title}
              </h1>
              <div
                className="problem-statement"
                dangerouslySetInnerHTML={{
                  __html: problem.problemStatement,
                }}
              />
              <div className="io-section">
                <h2>Input</h2>
                <div
                  className="io-input"
                  dangerouslySetInnerHTML={{
                    __html: problem.inputSpecification,
                  }}
                />
                <h2>Output</h2>
                <div
                  className="io-output"
                  dangerouslySetInnerHTML={{
                    __html: problem.outputSpecification,
                  }}
                />
              </div>
              <div className="problem-limits">
                <div className="limit-item">{problem.timeLimit}</div>
                <div className="limit-item">{problem.memoryLimit}</div>
              </div>
              <div className="example-cases">
                {problem.inputExamples.map((input, index) => (
                  <div key={index} className="example-case">
                    <h3 className="example-title">Example {index + 1}</h3>
                    <div>
                      <strong>Input:</strong>
                      <pre>{input}</pre>
                    </div>
                    <div>
                      <strong>Output:</strong>
                      <pre>{problem.outputExamples[index]}</pre>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="problem-note"
                dangerouslySetInnerHTML={{
                  __html: problem.note,
                }}
              />
              <div className="footer-note">
                <p>
                  Note: Current version of c++ supported is nearby 10, we'll
                  soon upgrade it
                </p>
                <p>
                  If there are multiple answers of the problem then the
                  verdict may show wrong answer
                </p>
                <a
                  href={`https://codeforces.com/contest/${contestId}/problem/${problemId}`}
                >
                  Credits: codeforces
                </a>
              </div>
            </div>
            <div className="resizer" onMouseDown={handleMouseDown}>
              <div className="resizer-handle"></div>
            </div>
            <div
              className="ide-container"
              style={{ width: `${100 - leftWidth}%` }}
            >
              <ProblemIde
                inputExamples={problem.inputExamples}
                outputExamples={problem.outputExamples}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SingleQuestion;
