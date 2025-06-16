const express = require('express');
const Route = express.Router();

const Compilercontroller = require('../Controllers/CompilerController')

Route.get('/dummy',Compilercontroller.dummy);
Route.get('/pr',Compilercontroller.getRandomProblem)
Route.post('/run',Compilercontroller.runcod)

module.exports = Route;