const express = require('express');
const formidable = require('formidable');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

function move(oldPath, newPath, callback) {

fs.rename(oldPath, newPath, function (err) {
    if (err) {
        if (err.code === 'EXDEV') {
            copy();
        } else {
            callback(err);
        }
        return;
    }
    callback();
});

function copy() {
    var readStream = fs.createReadStream(oldPath);
    var writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.on('close', function () {
        fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
}
}

app.get('/', (req, res) => {
  res.header('Content-Type', 'text/html')
  res.write('Submit a file to view its filesize')
  res.write('<form action="/get-file-size" method="post" enctype="multipart/form-data">')
  res.write('<input type="file" name="filetoupload">')
  res.write('<input type="submit">')
  res.write('</form>')
  res.end();
});

app.post('/get-file-size', (req, res) => {
  const form = formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const oldpath = files.filetoupload.path;
    const newpath = './file';
    move(oldpath, newpath, function(err) {
      res.send({
        size: fs.statSync(newpath).size,
      });
    });
  });
});

app.listen(port, () => {
  console.log(`App started on port ${port}`)
});