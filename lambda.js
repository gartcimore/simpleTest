// lambda.js
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./dist/simpleTest/server/main')
app.
exports.handler = serverlessExpress({ app })
