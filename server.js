// Inporting modules and packages being used
const express = require('express');
const path = require('path');
const fs = require('fs');
const notes = require('./db/db.json');
const {v4: uuidv4} = require('uuid'); // Using to give ID's to notes in db

// Seeting up variable using express app and defining a port value
const PORT = process.env.PORT || 3002;
const app = express();

// Middleware for parsing JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files - specifically from public
app.use(express.static('public'));

// Route for retreiving the /notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});
// Geting all notes
app.get('/api/notes', (req, res) => {
    res.json(notes);
});
// Adding a new note
app.post('/api/notes', (req, res) => {
   const newNote = req.body;
    newNote.id = uuidv4();
   notes.push(newNote);
   fs.writeFileSync('./db/db.json', JSON.stringify(notes));
   res.json('Note added');
});
// Deleting a note by ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id
    const noteIndex = notes.findIndex((note) => note.id == noteId);

    /* If the note with the specified ID exists, remove it and refresh the db,
    send a response indicating the delete, as well as sending a 404 status if note not found */
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1); 
        fs.writeFileSync('./db/db.json', JSON.stringify(notes)); 
        res.json('Note deleted');
    } else {
        res.status(404).json('Note not found');
    }
});

// Start the express server and listen on the port specified (3002)
app.listen(PORT, () => {
    console.log("App is listening");
});