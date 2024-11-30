import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});
const CODEFORCES_API = axios.create({
  baseURL: "https://codeforces.com/api",
});

/**
 * Fetches the available languages and filters for the required ones.
 * @returns {Promise<Array>} Array of selected languages and their versions.
 */
export const getLanguages = async () => {
  try {
    const response = await API.get("/runtimes");
    const languages = response.data;

    // Filter to include only specific languages
    const requiredLanguages = ["c++", "python", "java"];
const filteredLanguages = languages.filter((lang) => {
  // Include all languages except the first "javascript" entry
  if (lang.language === "javascript" && lang.runtime === "node") {
    return true;
  }
  return requiredLanguages.includes(lang.language);
});

    return filteredLanguages; // Return only required languages
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
};

/**
 * Executes the code using the selected language and version.
 * @param {string} language - The selected programming language.
 * @param {string} version - The selected version of the language.
 * @param {string} sourceCode - The source code written by the user.
 * @param {string} input - Optional stdin input for the code.
 * @returns {Promise<Object>} The response from the code execution API.
 */
export const executeCode = async (
  language,
  version,
  sourceCode,
  input = ""
) => {
  try {
    const response = await API.post("/execute", {
      language, // Language selected by the user
      version, // Language version selected by the user
      files: [
        {
          content: sourceCode, // User's source code
        },
      ],
      stdin: input, // Input passed to the program
    });
    return response.data; // Return execution result
  } catch (error) {
    console.error("Error executing code:", error);
    throw error;
  }
}; 

/**
 * Fetches the list of contests from Codeforces.
 * @returns {Promise<Array>} List of contests.
 */
export const fetchContests = async () => {
  try {
    const response = await CODEFORCES_API.get("/contest.list");
    if (response.data.status === "OK") {
      return response.data.result;
    } else {
      throw new Error("Failed to fetch contests");
    }
  } catch (error) {
    console.error("Error fetching contests:", error);
    throw error;
  }
};

/**
 * Fetches the questions for a specific contest by its ID.
 * @param {string} contestId - ID of the contest.
 * @returns {Promise<Array>} List of questions in the contest.
 */
export const fetchContestQuestions = async (contestId) => {
  try {
    const response = await CODEFORCES_API.get(`/contest.standings?contestId=${contestId}`);
    if (response.data.status === "OK") {
      return response.data.result.problems || [];
    } else {
      throw new Error("Failed to fetch contest questions");
    }
  } catch (error) {
    console.error("Error fetching contest questions:", error);
    throw error;
  }
};

export const fetchContestDetails = async (contestId) => {
  try {
    const response = await CODEFORCES_API.get(`/contest.list`);
    // console.log("API Response:", response.data); // Log the entire response

    if (response.data.status === "OK") {
      const contests = response.data.result;
      // console.log("Fetched contests:", contests); // Log all contests fetched

      // Explicitly match the contest ID
      const contest = contests.find((contest) => contest.id === parseInt(contestId, 10));
      // console.log("Found contest:", contest); // Log the found contest

      if (contest) {
        return contest; // Return the contest details
      } else {
        throw new Error(`No contest found with ID: ${contestId}`);
      }
    } else {
      throw new Error(`Error fetching contests: ${response.data.comment}`);
    }
  } catch (error) {
    console.error("Error fetching contest details:", error.message || error);
    throw error;
  }
};

export const fetchFinishedContests = async () => {
  try {
    const response = await CODEFORCES_API.get(`/contest.list`);
    if (response.data.status === "OK") {
      const contests = response.data.result;

      // Filter only finished contests
      const now = Date.now() / 1000; // current time in seconds
      const pastContests = contests.filter(contest => contest.phase === "FINISHED" && contest.startTimeSeconds < now);

      return pastContests;
    } else {
      throw new Error("Failed to fetch contests");
    }
  } catch (error) {
    console.error("Error fetching contests:", error);
    throw error;
  }
};

/**
 * Fetches the problems for a specific contest by its ID.
 * @param {string} contestId - ID of the contest.
 * @returns {Promise<Array>} List of problems in the contest.
 */
export const fetchContestProblems = async (contestId) => {
  try {
    const response = await CODEFORCES_API.get(`/contest.standings?contestId=${contestId}`);
    if (response.data.status === "OK") {
      // Return the list of problems from the contest
      return response.data.result.problems || [];
    } else {
      throw new Error("Failed to fetch contest problems");
    }
  } catch (error) {
    console.error("Error fetching contest problems:", error);
    throw error;
  }
};

export const fetchSingleProblemDetails = async (contestId, problemIndex) => {
  try {
    const response = await CODEFORCES_API.get(`/problem_details/${contestId}/${problemIndex}`);
    if (!response.ok) {
      throw new Error("Problem details fetch failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching problem details:", error);
    throw error;
  }
};

export const fetchProblemDetails = async (contestId, problemIndex) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/problem/${contestId}/${problemIndex}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching problem details:", error);
    throw error;
  }
};