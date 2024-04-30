#!/usr/bin/env node

const pkg = require('@yao-pkg/pkg');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const argv = process.argv.slice(2);

const archive = archiver('zip', {
    zlib: {
        level: 9
    }
});

archive.on('close', async () => {
    console.log("[$] Project files compressed");
    const hash = crypto.createHash('sha256');
    const rs = fs.createReadStream(__dirname + '/boilerplate/app.zip');

    console.log("[*] Calculating project SHA256 hash...")
    rs.on('data', (data) => { hash.update(data); });
    rs.on('end', async () => {
        console.log("[*] Writing hash to file...")
        fs.writeFileSync(__dirname + '/boilerplate/app.zip.sha256', hash.digest('hex'));
        console.log("[$] Hash written to file");

        console.log("[*] Packaging project files...");
        await pkg.exec([
            __dirname + '/boilerplate/index.js',
            '--targets', 'node20-windows-x64',
            '--config', __dirname + '/boilerplate/package.json',
            '--output', path.resolve(argv[1])
        ]);
        console.log("[$] Project files packaged to", path.resolve(argv[1]));
    });
});

archive.on('warning', (err) => {
    console.error(err);
});

archive.on('error', (err) => {
    console.error(err);
});

console.log("[*] Compressing project files...");

archive.pipe(fs.createWriteStream(__dirname + '/boilerplate/app.zip'));
archive.glob('**/*', { cwd: path.resolve(process.cwd(), argv[0]), dot: true });
// archive.directory(path.resolve(process.cwd(), argv[0]), false);

archive.finalize();
