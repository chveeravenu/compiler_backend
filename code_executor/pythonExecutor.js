const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const { exec } = require("child_process");
const path = require("path");

const executePython = async (code, testCases) => {
  const jobId = uuid();
  const filename = `${jobId}.py`;
  const filepath = path.join(__dirname, "..", "temp", filename);

  await fs.writeFile(filepath, code);

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i].input;
    const expectedOutput = testCases[i].expectedOutput;

    const command = `docker run --rm -i -v "${filepath}:/app/code.py" python:3.10 python /app/code.py`;

    const result = await new Promise((resolve) => {
      const process = exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({
            input,
            output: stderr || error.message,
            passed: false,
          });
        } else {
          const output = stdout.trim();
          resolve({
            input,
            output,
            passed: output === expectedOutput,
          });
        }
      });

      process.stdin.write(input);
      process.stdin.end();
    });

    results.push(result);
  }

  await fs.unlink(filepath); // cleanup
  return results;
};

module.exports = executePython;
