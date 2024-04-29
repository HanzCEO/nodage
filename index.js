#!/usr/bin/env node

const pkg = require('@yao-pkg/pkg');
const archiver = require('archiver');
const fs = require('fs');

const argv = process.argv.slice(2);

const archive = archiver('zip', {
    zlib: {
        level: 0
    }
});
archive.pipe(fs.createWriteStream('boilerplate/app.zip'));
archive.directory(argv[0], false);
archive.finalize();

archive.on('close', async () => {
    await pkg.exec([
        'boilerplate/index.js',
        '--targets', 'node20-windows-x64',
        '--config', 'boilerplate/package.json',
        '--output', argv[1]
    ])
});