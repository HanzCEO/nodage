const fs = require('fs');
const DecompressZip = require('decompress-zip');
const { spawn } = require('child_process');

const dir = process.cwd();

const extractor = new DecompressZip(__dirname + '/app.zip');
const appUUID = fs.readFileSync(__dirname + '/app.zip.sha256', 'utf8').toString();
const appDir = dir + '/' + appUUID;

function startApp() {
    process.chdir(appDir);
    try {
        const package = JSON.parse(fs.readFileSync(appDir + '/package.json'));
        const child = spawn(
            process.argv[0], [appDir + '/' + package.main, process.argv.slice(2)],
            {
                cwd: appDir, shell: true,
                stdio: 'inherit', detached: false
            });
    } catch (e) {
        console.error(e);
    } finally {
        if (process.env.REMOVE_APP_DIR == '1') {
            fs.rmSync(appDir, { recursive: true });
        }
    }
}

extractor.on('extract', () => {
    startApp();
});

extractor.on('error', (err) => {
    console.error(err);
})

if (fs.existsSync(appDir + '/package.json')) {
    // Don't extract if the app is already extracted
    startApp();
} else {
    extractor.extract({
        path: appDir + '/'
    });
}