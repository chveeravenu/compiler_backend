const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const { spawn } = require("child_process");
const path = require("path");

const executeJava = async (code, testCases) => {
  const jobId = uuid().slice(0, 8);
  const className = `Main${jobId}`;
  const filename = `${className}.java`;
  const filepath = path.join(__dirname, "..", "temp", filename);

  // Ensure the class name is updated properly
  let updatedCode = code;
  if (/public\s+class\s+\w+/.test(code)) {
    updatedCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
  } else {
    return testCases.map(tc => ({
      input: tc.input,
      output: "Error: No public class found.",
      passed: false
    }));
  }

  await fs.writeFile(filepath, updatedCode);

  const results = [];

  for (let test of testCases) {
    const { input, expectedOutput } = test;

    const command = [
      "run", "--rm", "-i",
      "-v", `${filepath}:/app/${filename}`,
      "openjdk:latest", "sh", "-c",
      `javac /app/${filename} && java -cp /app ${className}`
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
        const error = stderr.trim();

        resolve({
          input,
          output: output || error,
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

module.exports = executeJava;
