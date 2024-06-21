#!/usr/bin/env node

const pkg = require('@yao-pkg/pkg');
const tar = require('tar');
const fastGlob = require('fast-glob');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const argv = process.argv.slice(2);
const projectCwd = path.resolve(process.cwd(), argv[0]);

console.log("[*] Generating files...");
fs.mkdirSync(path.join(projectCwd, '.nodage'), { recursive: true });
fs.copyFileSync(__dirname + '/node-20', path.join(projectCwd, '.nodage/node.exe'));

console.log("[*] Compressing project files...");

console.log(path.join(__dirname, 'boilerplate/app.tgz'))

const files = [
    ...fastGlob.sync('**/*', { cwd: path.resolve(process.cwd(), argv[0]), dot: true })
];
// TODO: __dirname + ... must be replaced with path.join
tar.create({
    gzip: true,
    file: path.join(__dirname, 'boilerplate/app.tgz'),
    cwd: projectCwd
}, files)
.then(_ => {
    console.log("[$] Project files compressed");
    const hash = crypto.createHash('sha256');
    const rs = fs.createReadStream(__dirname + '/boilerplate/app.tgz');

    console.log("[*] Calculating project SHA256 hash...")
    rs.on('data', (data) => { hash.update(data); });
    rs.on('end', async () => {
        console.log("[*] Writing hash to file...")
        fs.writeFileSync(__dirname + '/boilerplate/app.tgz.sha256', hash.digest('hex'));
        console.log("[$] Hash written to file");

        console.log("[*] Packaging project files...");
        await pkg.exec([
            __dirname + '/boilerplate/index.js',
            '--targets', 'node20-windows-x64',
            '--config', __dirname + '/boilerplate/package.json',
            '--output', path.resolve(argv[1])
        ]);
        console.log("[$] Project files packaged to", path.resolve(argv[1]));

        console.log("[*] Cleaning up...")
        fs.unlinkSync(__dirname + '/boilerplate/app.tgz');
        fs.unlinkSync(__dirname + '/boilerplate/app.tgz.sha256');
        fs.rmSync(path.join(projectCwd, '.nodage'), { recursive: true, force: true });
        console.log("[$] Cleaned up");
    });
}).catch(err => console.log(err));