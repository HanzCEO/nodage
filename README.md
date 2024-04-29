# nodage
Package your node.js project into a single executable file

## Usage
```
npm i -g nodage
nodage myProjectDir myOutputFile.exe
```

## How it works
1. Zip your entire project file (including its `node_modules`)
2. Add a wrapper to spawn `node yourAppMain.js`
3. Ship your zipped app with `@yao-pkg/pkg`
4. Done

## ToDo
- [ ] Ship our own `pkg` by forking `@yao-pkg/pkg`
- [ ] Add information for zipping progress
- [ ] Add colors to `nodage` console
- [ ] Accept CLI flags and options