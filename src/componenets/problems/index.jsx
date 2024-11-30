import React, { useEffect, useState } from "react";
import { fetchFinishedContests, fetchContestProblems } from "../utils/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./style.scss";

const ProblemPage = () => {
  const [contests, setContests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState([1, 2, 3, 4]);

  // Load contests and problems for the current page
  useEffect(() => {
    const loadContests = async () => {
      try {
        setLoading(true);
        const contestsData = await fetchFinishedContests();
        setContests(contestsData);
  
        // Load problems for the contests on the current page
        loadProblemsForPage(contestsData, currentPage);
      } catch (error) {
        console.error("Failed to load contests:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadContests();
  }, [currentPage]);

  // Load problems for the contests on the selected page
  const loadProblemsForPage = async (contestsData, page) => {
    const contestsPerPage = 3; // Since we want 4 pages in the middle
    const startIndex = (page - 1) * contestsPerPage;
    const selectedContests = contestsData.slice(startIndex, startIndex + contestsPerPage);

    const problems = await Promise.all(
      selectedContests.map(async (contest) => {
        const contestProblems = await fetchContestProblems(contest.id);
        return contestProblems;
      })
    );

    // Flatten the array and update questions
    const flatProblems = problems.flat();
    setQuestions(flatProblems);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Fetch problems for the new page
    loadProblemsForPage(contests, newPage);

    // Scroll to top
    window.scrollTo(0, 0);
  };

  // Update the visible pages when current page changes
  useEffect(() => {
    const totalPages = Math.ceil(contests.length / 4); // Adjust for 4 pages per set
    let startPage = currentPage - 2; // Always include page 1
    let endPage = currentPage + 1;

    // Adjust the start and end pages based on the total pages
    if (startPage < 1) startPage = 1;
    if (endPage > totalPages) endPage = totalPages;

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    setVisiblePages([1, ...pages.slice(1)]); // Ensure page 1 is always included
  }, [currentPage, contests]);

  return (
    <div className="problem-page">
      {loading && <LoadingSpinner />}
      <div className="problem-list">
        <div className="problem-header">
          <span className="header-column">Problem ID</span>
          <span className="header-column">Question Name</span>
          <span className="header-column">Rating</span>
        </div>
        {questions.map((problem, index) => (
          <div key={index} className="problem-row">
            <span className="problem-id">
              {problem.contestId + problem.index}
            </span>
            <div className="problem-name" onClick={() =>
                    window.open(
                      `/problem/${problem.contestId}/${problem.index}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }>

                {problem.name}

            </div>
            <span className="problem-difficulty">
              {isNaN(problem.rating) || problem.rating === undefined || problem.rating === null
                ? "NA"
                : problem.rating}
            </span>
          </div>
        ))}
      </div>

      <div className="pagination">
        {/* "Previous" Button */}
        <button
          className="page-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`page-button ${currentPage === page ? "active" : ""}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* "Next" Button */}
        <button
          className="page-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(contests.length / 4)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProblemPage;
