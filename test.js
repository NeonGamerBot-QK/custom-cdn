const FormData = require('form-data');     const fs = require('fs')
const form = new FormData();

const buffer =  fs.readFileSync('./urfilepath.txt')
const fileName = 'test.gif';
const fetch = require('node-fetch')
form.append('sampleFile', buffer, {
  contentType: 'image/gif',
  name: 'file',
  filename: fileName,
});
const img;
fetch('https://cdn.nongmerbot.repl.co/upload', { method: 'POST', body: form }).then(res => {
    img = 'https://cdn.nongmerbot.repl.co/uploads/' + fileName
})
message.channel.send(img)