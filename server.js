const express = require('express');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT|| 3003;
const { v4: uuidv4 } = require('uuid');
// call uuid uuidv4();
const util = require('util');

const readFromFile = util.promisify(fs.readFile);

const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"));
  });

  app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"));
  });


app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));


    console.info(`${req.method} request received for notes`);

}); 


app.post('/api/notes', (req, res) => {
    console.info(`${req.method} Added note!🚀 `);


    const { title, text } = req.body

        if(req.body) {
          
    const newNote = {
      title, 
      text, 
      id: uuidv4(),
     };

  readAndAppend(newNote, './db/db.json');
  res.json(`Note added! 🚀`);
  } else {
    res.error('Error in adding note!');
  }

});

// Thank you Erin for the walk through on this
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all notes except the one with the ID provided in the URL
      const result = json.filter((note) => note.id !== noteId);

      // Save that array to the filesystem
      writeToFile('./db/db.json', result);

      // Respond to the DELETE request
      res.json(`Item ${noteId} has been deleted 🗑️`);
    });
});
// app.delete('/api/notes/:id', (req, res) => {
//   res.send('Got a DELETE request at /user')
// });



  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
  });