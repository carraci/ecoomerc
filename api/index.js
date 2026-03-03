// Vercel Serverless Entry Point
// Vercel requires functions to live in the /api directory.
// This file simply re-exports the Express app from /server/index.js

module.exports = require('../server/index.js');
