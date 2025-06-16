const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');

const runJava = async (code, inputs) => {
  const jobId = uuidv4();
  const dir = path.join(__dirname, '..', 'temp', jobId);
  const filePath = path.join(dir, 'Main.java');

  await fs.ensureDir(dir);
  await fs.outputFile(filePath, code);

  const compile = spawn('javac', [filePath]);

  return new Promise((resolve, reject) => {
    let compileErr = '';
    compile.stderr.on('data', (data) => {
      compileErr += data.toString();
    });

    compile.on('close', async (code) => {
      if (compileErr) {
        resolve(inputs.map(input => ({
          input,
          output: compileErr.trim(),
          passed: false
        })));
        await fs.remove(dir);
        return;
      }

      const results = [];

      for (const input of inputs) {
        const result = await new Promise((resolveTest) => {
          const run = spawn('java', ['Main'], { cwd: dir });

          let output = '';
          let error = '';

          run.stdout.on('data', (data) => {
            output += data.toString();
          });

          run.stderr.on('data', (data) => {
            error += data.toString();
          });

          run.on('close', () => {
            resolveTest({
              input,
              output: error ? error.trim() : output.trim(),
              passed: !error
            });
          });

          run.stdin.write(input + '\n');
          run.stdin.end();
        });

        results.push(result);
      }

      await fs.remove(dir);
      resolve(results);
    });
  });
};

module.exports = runJava;
