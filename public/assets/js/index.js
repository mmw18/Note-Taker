let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

/* Checking if the current page is the notes page (aka. the URL ends with /notes)
If this is true, we assign the DOM elements to variables so they can be used here */
if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}
// Declaring variable to display HTML elements
const show = (elem) => {
  elem.style.display = 'inline';
};

// Declaring variable to hide HTML elements
const hide = (elem) => {
  elem.style.display = 'none';
};

// Declaring an object variable that will be used to keep track of the note in the textarea
let activeNote = {};
// Declaring variable for a fetch request to GET notes from /notes
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
// Declaring a varaible to save or POST notes to /notes
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });
// Declaring variable to DELETE notes from /notes
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
// Function to render the currently active note
const renderActiveNote = () => {
  // Removing the clear and save note buttons from view
  hide(saveNoteBtn);
  hide(clearBtn);
  /* If there is an active note: display the new note button and set the input feilds to 
  read-only. Input feild values are set to the activeNote's title and text*/
  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    // If no activeNote, hide the new note button and make input feilds editable and cleared
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};
/* Function for saving a note: assigning the input values to newNote variable, and then using
that variable in the saveNote funciton, we render all notes, including activeNote */
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Function for deleting a clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();
  // Get the specific delete button clicked based off id of parent note
  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;
  // If the current activeNote matches the selected note to be deleted, clear the activeNote object variable of value
  if (activeNote.id === noteId) {
    activeNote = {};
  }
  // Entering our noteId into the delete function to remove the selected note
  // The - re-rendering all notes, including active
  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  console.log('Clicked on note in the sidebar');
  e.preventDefault();
  e.stopPropagation(); 
  const selectedNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  activeNote = { ...selectedNote };
  // ^Making the selected note be the new 'active note'
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  // showing clear button by default
  show(clearBtn);
  // If input feilds are blank hide the clear button
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  // If either the title or text input is empty, hide save button
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  // If both input areas have value, show the save note button
  } else {
    show(saveNoteBtn);
  }
};

// Asynchronous function to render the list of notes
const renderNoteList = async (notes) => {
  // await for the JSON representation of notes to be retrieved from the server
  let jsonNotes = await notes.json();

  // If the current page's path is /notes, clear the content of existing note list elements
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }
};

  // Declaring a variable and initializing it with an empty array
  let noteListItems = [];

  // Function to create a list item for a note
  const createLi = (text, id, delBtn = true) => {
    // Creating the li element
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
    // Declaring span element for note title
    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);
    // Appending the span element to the li 
    liEl.append(spanEl);
    // If a delete button should be included, create and style it
    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);
      // Appending the delete button to the list item
      liEl.append(delBtnEl);
    }
    // Return the created list item (:
    return liEl;
  };
  // If there are no saved notes, push a special list item indicating there are no saved notes
  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }
  // Iterate through each note to create a list item for it
  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    // Pushing the created list to the array
    noteListItems.push(li);
  });
  // If the current page is /notes, append each list item to the note list
  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  };


// Gets notes from the db and renders them
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
  // Event listener for handling click on the delete button within the note list
  noteList.forEach((list) => {
    list.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-note')) {
        handleNoteDelete(e);
      }
    });
  });
}
// Calling function to retrieve and render all saved notes
getAndRenderNotes();
