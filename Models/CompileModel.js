const express = require('express');
const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // URL-friendly unique id
  description: { type: String, required: true }, // full problem statement in markdown or HTML
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  tags: [String], // e.g. ['Array', 'Hash Table']
  sampleTestCases: [testCaseSchema], // sample inputs and outputs
  constraints: [String], // constraints listed as strings
  starterCode: { type: Map, of: String }, // language: starter code snippet
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("problemSchema",problemSchema);