const express = require('express');
const mydb = require('../Models/CompileModel');

const axios = require("axios");

const dummy = async (req, res) => {
  console.log('API hit: /dummy');
  return res.status(200).json("API hit successfully");
};

const getRandomProblem = async (req, res) => {
  try {
    const count = await mydb.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const problem = await mydb.findOne().skip(randomIndex);

    if (!problem) {
      return res.status(404).json({ error: 'No problems found in the database.' });
    }

    return res.status(200).json(problem);
  } catch (error) {
    console.error('Error fetching random problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const runcod = async (req, res) => {
  try {
    const { language, version, code, testCases } = req.body;

    if (!language || !version || !code || !Array.isArray(testCases)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const results = [];

    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;

      const payload = {
        language,
        version,
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
        stdin: input,
      };

      const pistonRes = await axios.post("https://emkc.org/api/v2/piston/execute", payload);
      const actualOutput = pistonRes.data.run.stdout.trim();
      const status = actualOutput === expectedOutput.trim() ? "pass" : "fail";

      results.push({
        input,
        expected: expectedOutput,
        actual: actualOutput,
        status,
      });
    }

    return res.json({ results });

  } catch (error) {
    console.error("Error running code:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Something went wrong while executing the code." });
  }
};

// Helper to determine file extension based on language
function getFileExtension(language) {
  switch (language.toLowerCase()) {
    case "python":
      return "py";
    case "cpp":
    case "c++":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "javascript":
      return "js";
    default:
      return "txt";
  }
}





module.exports = {
  dummy,
  getRandomProblem,
  runcod
};
