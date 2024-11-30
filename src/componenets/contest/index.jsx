// src/pages/ContestPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchContests } from "../utils/api";
import "./style.scss";

const Contest = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  const formatDate = (timestamp) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(timestamp * 1000).toLocaleDateString(undefined, options);
  };

  const calculateTimer = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = timestamp - now;

    if (remaining > 86400) {
      const days = Math.floor(remaining / 86400);
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (remaining > 0) {
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return "Started";
  };

  const formatDuration = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`; // Format as hh:mm
  };

  useEffect(() => {
    const loadContests = async () => {
      try {
        const allContests = await fetchContests();
        const now = Math.floor(Date.now() / 1000);

        const upcomingContests = allContests
          .filter((contest) => contest.startTimeSeconds > now)
          .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

        const pastContests = allContests.filter(
          (contest) => contest.startTimeSeconds <= now
        );

        setUpcoming(upcomingContests);
        setPast(pastContests);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
      }
    };

    loadContests();
  }, []);

  return (
    <div className="contest-page">
      <h1>Codeforces Contests</h1>

      <section>
        <h2>Upcoming Contests</h2>
        <div className="contest-table">
          <div className="contest-row header">
            <div className="contest-name">Name</div>
            <div className="contest-duration">Length</div>
            <div className="contest-start">Start</div>
            <div className="contest-timer">Remaining Time</div>
          </div>
          {upcoming.map((contest) => (
            <div className="contest-row upcoming" key={contest.id}>
              <div className="contest-name">
                <Link to={`/contest/${contest.id}`}>{contest.name}</Link>
              </div>
              <div className="contest-duration">
                {formatDuration(contest.durationSeconds)}
              </div>
              <div className="contest-start">
                {formatDate(contest.startTimeSeconds)}{" "}
                {new Date(contest.startTimeSeconds * 1000)
                  .toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
              <div className="contest-timer">
                {calculateTimer(contest.startTimeSeconds)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Past Contests</h2>
        <div className="contest-table">
          {past.map((contest) => (
            <div className="contest-row past" key={contest.id}>
              <div className="contest-name">
                <Link to={`/contest/${contest.id}`}>{contest.name}</Link>
              </div>
              <div className="contest-duration">
                {formatDuration(contest.durationSeconds)}
              </div>
              <div className="contest-start">
                {formatDate(contest.startTimeSeconds)}{" "}
                {new Date(contest.startTimeSeconds * 1000)
                  .toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
              <div className="contest-timer">Ended</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contest;
