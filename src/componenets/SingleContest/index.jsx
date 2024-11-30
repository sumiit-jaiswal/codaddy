import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchContestQuestions, fetchContestDetails } from "../utils/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner"; // Import the Loading Spinner
import "./style.scss";

const SingleContest = () => {
  const { id } = useParams(); // Get contestId from URL params
  const [questions, setQuestions] = useState([]);
  const [contestName, setContestName] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContestDetails = async () => {
      try {
        setLoading(true);
        const contestDetails = await fetchContestDetails(id);
        setContestName(contestDetails.name); // Set the contest name
        const questionsData = await fetchContestQuestions(id);
        setQuestions(questionsData);
      } catch (error) {
        setError(
          "Contest not started or Failed to fetch contest details or questions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadContestDetails();
  }, [id]);

  return (
    <div className="single-contest">
      {loading && <LoadingSpinner />}{" "}
      {/* Show the loading spinner when loading */}
      {error && <p className="error">{error}</p>} {/* Show error message */}
      {!loading && !error && (
        <div>
          {/* Contest ID and Name */}
          <div className="contest-header">
            <h1>Contest : {id}</h1>
            <p>{contestName}</p>
          </div>

          {/* Table Header */}
          <div className="table-header">
            <div>Problem ID</div>
            <div>Problem Name</div>
            <div>Rating</div>
          </div>

          {/* Questions List */}
          <div className="question-list">
            {questions.map((question, index) => (
              <div key={index} className="question-row">
                <div className="problem-id">
                  {id + question.index} {/* Display complete Problem ID */}
                </div>
                <div
                  className="problem-name"
                  onClick={() =>
                    window.open(
                      `${window.location.origin}/problem/${id}/${question.index}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  {question.name}
                </div>
                <div className="problem-rating">{question.rating || "N/A"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleContest;
