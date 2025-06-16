const express = require('express');
const mydb = require('../Models/CompileModel');
const executePython = require("../code_executor/pythonExecutor.js");
const executeCpp = require("../code_executor/cppExecutor.js");
const executeJava = require("../code_executor/javaExecutor.js");
const executeC = require("../code_executor/cExecutor.js");

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

const runcod = async (req,res) =>{
  const { language, code, testCases } = req.body;

  if (!language || !code || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "Missing or invalid parameters." });
  }

  try {
    let results;

    switch (language.toLowerCase()) {
      case "python":
        results = await executePython(code, testCases);
        break;
      case "cpp":
        results = await executeCpp(code, testCases);
        break;
      case "java":
        results = await executeJava(code, testCases);
        break;
      case "c":
        results = await executeC(code, testCases);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language." });
    }

    res.json({ status: "success", results });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }

};


module.exports = {
  dummy,
  getRandomProblem,
  runcod
};
