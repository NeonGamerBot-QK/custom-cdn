const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const JSONdb = require('simple-json-db');

const useConfig = require('./util/useConfig');
const fileUpload = require('express-fileupload');
const { randomUUID } = require('crypto');
const config = useConfig();
function Authenticated(req,res,next) {
    if(!req.session.loggedin && req.headers["Content-type"] === "application/json") return res.redirect("/login");
    else if(req.headers.authorization !== config.KEY && !req.session.loggedin) return res.status(401).json({ success: false, error: 1 });
    else next()
}

module.exports = (db) => {
  router.use(fileUpload())
  router.get("/isloggedin", Authenticated, (req,res) => res.status(200).end())
  router.post("/login", (req, res) => {
      // console.debug(req.body)
      if (req.body.password == config.KEY) {
          req.session.loggedin = true;
          req.session.key = req.body.key;
       res.json({ success: true, message: "Logged in successfully" })
      } else {
          res.json({ success: false, error: 1 })
      }
  })
  router.get('/cookies', (req, res) => {
  res.json(req.session)    
  })
  
  router.get("/fileslist", Authenticated, (req, res) => {
      res.json({ success: true, files: (db.get("posts") || []).map(e => e.name) })
  })
  router.delete("/delete/:id", Authenticated, (req, res) => {
  const file = (db.get("posts") || []).find(e => e.id === req.params.id);
  if(!file) return res.status(404).json({ success: false, error: 2, message: "File not found" })
    const posts = (db.get("posts") || []).filter(e => e.id !== req.params.id);
  db.set("posts", posts);
  fs.rmSync(file.path) 
    res.status(200).json({ success: true, message: "Deleted file" })
  })
  router.post('/upload',Authenticated, async function(req, res) {
  
      if (!req.files || Object.keys(req.files).length === 0) {
        console.log(req.body, req.headers)
        return res.status(400).send('No files were uploaded.');
      }
    const names = []
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      const uploadedAt = Date.now();
  
    for (const f in req.files) {
  const files = Array.isArray(req.files[f]) ? req.files[f] : [req.files[f]];
  files.forEach(file => {
      const name = file.name;
      const id = randomUUID()
      const uploadPath = path.join(__dirname, 'files', id + "." + name.split('.')[name.split('.').length - 1]);
      fs.writeFileSync(uploadPath, file.data);
      const posts = db.get("posts") || [];
      posts.push({ name: name, id: id, path: uploadPath, size: file.size, enc: file.mimetype, private: req.body.private, uploadedAt, caption: req.body.caption });
      names.push({ name: name, id: id, path: uploadPath, size: file.size, enc: file.mimetype })
  
      db.set("posts", posts);
  })
    }
    
      res.json({ success: true, message: "Uploaded successfully", files: names, private: req.body.private || false, uploadedAt, caption: req.body.caption, firstId: names[0].id })
    });
    router.get("/sharexconfig", Authenticated, (req,res) => {
      let template = `{
        "Version": "15.0.0",
        "Name": "CDN",
        "DestinationType": "ImageUploader, FileUploader",
        "RequestMethod": "POST",
        "RequestURL": "http://YOUR_URL/api/upload",
        "Headers": {
          "authorization": "YOUR_KEY"
        },
        "Body": "MultipartFormData",
        "Arguments": {
          "caption": "Uploaded using shareX"
        },
        "FileFormName": "file",
        "URL": "http://YOUR_URL/files/{json:firstId}",
        "DeletionURL": "http://YOUR_URL/delete?id={json:firstId}&a=1",
        "ErrorMessage": "Failed  to upload"
      }`
      let json = JSON.parse(template);
      json.RequestURL = config.URL + "/api/upload";
      json.Headers.authorization = config.KEY;
      json.URL = config.URL + "/files/{json:firstId}";
      json.DeletionURL = config.URL + "/delete?id={json:firstId}&a=1";
      res.json(json)
    })
    return router;
}