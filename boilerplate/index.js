const fs = require('fs');
const unzipper = require('unzipper');

const dir = process.cwd();

const appUUID = crypto.randomUUID();

const extractor = unzipper.Extract({ path: dir + `/${appUUID}/` });
const stream = fs.createReadStream(__dirname + '/app.zip');
stream.pipe(extractor);
extractor.on('close', () => {
    console.log(fs.readdirSync(dir + '/' + appUUID));
    fs.rmdirSync(dir + '/' + appUUID, { recursive: true });
});