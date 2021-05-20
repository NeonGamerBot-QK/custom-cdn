const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const baseurl = 'https://cdn.nongmerbot.repl.co'
const PORT = 8000;
app.use('/form', express.static(__dirname + '/index.html'));
app.use('/files/', express.static('uploads'))
// default options
app.use(fileUpload());
app.get('/', (req,res) => res.redirect('/form'))
app.get('/ping', function(req, res) {
  res.send('pong');
  console.log(req.headers)
});


app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }
 // eslint-disable-line
// console.log(req.body, req.files) debug
  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + '/uploads/' + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send('Uploaded! to use the file visit ' + `<a href="${baseurl}${sampleFile.name.toString().replace(' ', '%20')}"> Link </a> `);
  });
});

app.listen(PORT, function() {
  console.log('Express server listening on port ', PORT); // eslint-disable-line
});