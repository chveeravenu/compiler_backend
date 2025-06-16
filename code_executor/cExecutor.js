const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const { spawn } = require("child_process");
const path = require("path");

const executeC = async (code, testCases) => {
  const jobId = uuid();
  const filename = `${jobId}.c`;
  const filepath = path.join(__dirname, "..", "temp", filename);

  await fs.writeFile(filepath, code);

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i].input;
    const expectedOutput = testCases[i].expectedOutput;

    const command = [
      "run", "--rm", "-i",
      "-v", `${filepath}:/app/code.c`,
      "gcc:latest", "sh", "-c",
      "gcc /app/code.c -o /app/code.out && /app/code.out"
    ];

    const result = await new Promise((resolve) => {
      const process = spawn("docker", command);

      let stdout = "";
      let stderr = "";

      process.stdin.write(input);
      process.stdin.end();

      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", () => {
        const output = stdout.trim();
        resolve({
          input,
          output,
          passed: output === expectedOutput,
        });
      });

      process.on("error", (err) => {
        resolve({
          input,
          output: err.message,
          passed: false,
        });
      });
    });

    results.push(result);
  }

  await fs.unlink(filepath); // Cleanup
  return results;
};

module.exports = executeC;
