const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateFile } = require('../utils/fileManager');

const executeJava = async (code, inputList) => {
  const filePath = await generateFile('java', code);
  const dir = path.dirname(filePath);
  const className = path.basename(filePath, '.java');

  return new Promise((resolve, reject) => {
    const compile = spawn('javac', [filePath]);

    compile.stderr.on('data', (data) => {
      return reject({ error: data.toString() });
    });

    compile.on('close', async (status) => {
      if (status !== 0) return;

      const results = await Promise.all(
        inputList.map((input) => {
          return new Promise((resolve) => {
            const run = spawn('java', ['-cp', dir, className]);

            let output = '';
            let error = '';

            run.stdin.write(input);
            run.stdin.end();

            run.stdout.on('data', (data) => {
              output += data.toString();
            });

            run.stderr.on('data', (data) => {
              error += data.toString();
            });

            run.on('close', () => {
              resolve({
                input,
                output: error ? error.trim() : output.trim(),
                passed: error === '',
              });
            });
          });
        })
      );

      resolve(results);
    });
  });
};

module.exports = executeJava;
