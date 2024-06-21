const fs = require('fs');
const tar = require('tar');
const { spawn } = require('child_process');

const dir = process.cwd();

const appUUID = fs.readFileSync(__dirname + '/app.tgz.sha256', 'utf8').toString();
const appDir = dir + '/' + appUUID;

function startApp() {
    console.log(process.argv)
    process.chdir(appDir);
    try {
        const package = JSON.parse(fs.readFileSync(appDir + '/package.json'));
        const child = spawn(
            appDir + '/.nodage/node', [package.main, process.argv.slice(2)],
            {
                cwd: appDir, shell: true,
                stdio: 'inherit', detached: false
            }
        );
    } catch (e) {
        console.error(e);
    } finally {
        if (process.env.REMOVE_APP_DIR == '1') {
            fs.rmSync(appDir, { recursive: true });
        }
    }
}

if (fs.existsSync(appDir + '/package.json')) {
    // Don't extract if the app is already extracted
    startApp();
} else {
    fs.mkdirSync(appDir, { recursive: true });
    tar.extract({
        f: __dirname + '/app.tgz',
        cwd: appDir
    })
    .then(_ => {
        startApp();
    })
    .catch(err => console.error(err));
}