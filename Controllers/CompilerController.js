const express = require('express');
const mydb = require('../Models/CompileModel');
const runPython  = require("../code_executor/pythonExecutor.js");
const runCpp  = require("../code_executor/cppExecutor.js");
const runJava   = require("../code_executor/javaExecutor.js");
const runC  = require("../code_executor/cExecutor.js");

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
  const { language, code, inputs } = req.body;

  if (!language || !code || !Array.isArray(inputs)) {
    return res.status(400).json({ error: 'Missing or invalid parameters.' });
  }

  try {
    let results;

    switch (language.toLowerCase()) {
      case 'python':
        results = await runPython(code, inputs);
        break;

      case 'cpp':
        results = await runCpp(code, inputs);
        break;

      case 'c':
        results = await runC(code, inputs);
        break;

      case 'java':
        results = await runJava(code, inputs);
        break;

      default:
        return res.status(400).json({ error: 'Unsupported language.' });
    }

    return res.status(200).json({ status: 'success', results });

  } catch (err) {
    console.error('Execution Error:', err);
    return res.status(500).json({ error: 'Server error during code execution.' });
  }

};


module.exports = {
  dummy,
  getRandomProblem,
  runcod
};
