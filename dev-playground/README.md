## Dev Playground

Start from pdfmake ROOT directory with nodemon if you want server to restart with every change you make in pdfmake/src:

```
# nvm use 20 # use node 20 or latest
cd dev-playground
npm install # or: yarn
cd ..
npm install # or: yarn
npm run build
npm install -g nodemon
nodemon ./dev-playground/server.js
```
