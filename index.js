// Server

// Require dependencies
const express = require('express');
const path = require('path');
const mongo = require('mongodb');
const fs = require('fs');
const bodyParser = require('body-parser');

// Create app
const app = express();

// Set up middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

//


// Start listening
app.listen(80, () => console.log(`Server listening on port 80.`));
