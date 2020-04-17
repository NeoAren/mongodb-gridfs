//
// MongoDB GridFS example project
//

// Require dependencies
const express = require('express');
const mongo = require('mongodb');
const Busboy = require('busboy');
const uuid4 = require('uuid').v4;
const bodyParser = require('body-parser');

// Create app
const app = express();
const port = 80;

// Set up middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MongoDB URI
const uri = 'mongodb://localhost';

// Connect to MongoDB
mongo.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
   if (err) throw err;

   // Use 'mongofiles' database within MongoDB
   const db = client.db('mongofiles');

   // Set 'cloud' collection as GridFS storage
   const GridFS = new mongo.GridFSBucket(db, { bucketName: 'cloud' });

   /**
    * @rotue GET /
    * @desc Load all files and render index page
    */
   app.get('/', (req, res) => {
      GridFS.find().toArray((error, files) => {
         if (!files || !files.length) {
            res.render('index', { files: null });
         } else {
            files.map(file => {
               if (file.hasOwnProperty('contentType')) {
                  file.isImage = ['image/jpeg', 'image/png'].includes(file.contentType);
               }
            });
            res.render('index', { files });
         }
      });
   });

   /**
    * @route POST /upload
    * @desc  Upload a file to GridFS
    */
   app.post('/upload', (req, res) => {

      // Create Busboy instance
      const busboy = new Busboy({ headers: req.headers });

      // Listen for files in the request stream
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
         let writable;

         // When receiving data open upload stream and start sending data
         file.on('data', data => {
            if (!writable) writable = GridFS.openUploadStreamWithId(uuid4(), filename, { contentType: mimetype });
            writable.write(data, null, err => console.log('write', err));
         });

         // Stop sending data when no more data is received
         file.on('end', () => {
            if (writable) writable.end(null, null, (err, result) => console.log('end', err, result));
         });
      });

      // Listen for any other non-file fields
      busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
         req.body[fieldname] = val;
      });

      // Run when busboy read all the data from the request stream
      busboy.on('finish', () => {
         console.log('request body:', req.body);
         res.redirect('/');
      });

      // Pipe request stream into busboy
      req.pipe(busboy);

   });

   /**
    * @route GET /files
    * @desc  Display all files as json
    */
   app.get('/files', (req, res) => {
      db.collection('cloud.files').find({}, {}, (error, files) => {
         if (error) return res.status(500).json({ error });
         files.toArray((err, files) => {
            if (!files || !files.length) {
               return res.status(404).json({ error: 'No files exist.' });
            } else {
               return res.json(files);
            }
         });
      });
   });

   /**
    * @route GET /files/:id
    * @desc  Display file as json object
    */
   app.get('/files/:id', (req, res) => {
      db.collection('cloud.files').findOne({ _id: req.params.id }, {}, (error, file) => {
         if (!file) {
            res.status(404).json({ error: 'File not found.' });
         } else {
            res.json(file);
         }
      });
   });

   /**
    * @route GET /image/:id
    * @desc Download an image
    */
   app.get('/image/:id', (req, res) => {
      db.collection('cloud.files').findOne({ _id: req.params.id }, {}, (error, file) => {
         if (!file) {
            res.status(404).json({ error: 'File not found.' });
         } else if (!['image/jpeg', 'image/png'].includes(file.contentType)) {
            res.status(400).json({ error: 'File is not an image.' });
         } else {
            const readable = GridFS.openDownloadStream(file._id);
            readable.pipe(res);
         }
      });
   });

   /**
    * @route POST /delete/:id
    * @desc  Delete a file
    */
   app.post('/delete/:id', (req, res) => {
      GridFS.delete(req.params.id, error => {
         if (error) {
            res.status(500).json({ error });
         } else {
            res.redirect('/');
         }
      });
   });

});

// Start listening
app.listen(port, () => console.log(`Server listening on port ${port}.`));
