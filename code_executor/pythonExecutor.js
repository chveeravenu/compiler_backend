const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');

const runPython = async (code, inputs) => {
  const jobId = uuidv4();
  const filePath = path.join(__dirname, '..', 'temp', `${jobId}.py`);

  // Write code to file
  await fs.outputFile(filePath, code);

  const results = [];

  for (const input of inputs) {
    const result = await new Promise((resolve, reject) => {
      const process = spawn('python3', [filePath]);
      let output = '';
      let error = '';

      process.stdin.write(input + '\n');
      process.stdin.end();

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (error) {
          resolve({ input, output: error.trim(), passed: false });
        } else {
          resolve({ input, output: output.trim(), passed: true });
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });

    results.push(result);
  }

  // Cleanup
  await fs.remove(filePath);

  return results;
};

module.exports = runPython;
