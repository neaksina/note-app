// Initialization
const noteTitleInput = document.getElementById('note-title');
const addNoteButton = document.getElementById('addNote');
const notesContainer = document.getElementById('notes-container');
const noteColor = document.getElementById('note-color');
const noteEmoji = document.getElementById('note-emoji');
const reminderInput = document.getElementById('note-reminder');
const savePdfButton = document.getElementById('save-pdf');
const modal = document.getElementById('note-modal');

// Initialize notes and trash
const notes = JSON.parse(localStorage.getItem('notes')) || [];
const trash = JSON.parse(localStorage.getItem('trash')) || [];

// Render Notes on Page Load
renderNotes();

// Initialize Quill
const quill = new Quill('#note-content', {
    theme: 'snow',
    placeholder: 'Write your note here...',
});

// Show Modal
function showModal() {
    modal.style.display = 'block';
}

// Hide Modal
function hideModal() {
    modal.style.display = 'none';
}

// Render Notes
function renderNotes() {
    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card p-4 rounded shadow';

        noteCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
            <div class="mb-4">${note.content}</div>
            <p class="text-gray-500 text-sm">Created: ${moment(note.timestamp).format('LLL')}</p>
            <div class="flex space-x-2 mt-4">
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 edit-note">Edit</button>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 pin-note">Archive</button>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 delete-note">Delete</button>
            </div>
        `;

        // Handle Delete
        noteCard.querySelector('.delete-note').addEventListener('click', () => deleteNoteToTrash(index));

        // Handle Archive
        noteCard.querySelector('.pin-note').addEventListener('click', () => archiveNote(index));

        // Handle Edit
        noteCard.querySelector('.edit-note').addEventListener('click', () => editNote(index));

        notesContainer.appendChild(noteCard);
    });
}

///Darrk mood

// Render Trash
function renderTrash() {
    notesContainer.innerHTML = ""; // Clear current notes container
    trash.forEach(function(note, index) {
        const noteElement = document.createElement("div");
        noteElement.className = "note-card p-4 rounded shadow"; // Same class as note cards

        noteElement.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
            <div class="mb-4">${note.content}</div>
            <p class="text-gray-500 text-sm">Deleted on: ${moment(note.timestamp).format('LLL')}</p>
            <div class="flex space-x-2 mt-4">
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 restore-note">Restore</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 delete-note-permanently">Delete Permanently</button>
            </div>
        `;

        // Handle Restore
        noteElement.querySelector('.restore-note').addEventListener('click', () => restoreNote(index));

        // Handle Permanent Delete
        noteElement.querySelector('.delete-note-permanently').addEventListener('click', () => permanentlyDelete(index));

        notesContainer.appendChild(noteElement);
    });
}



// Search notes including trash
function searchNotes() {
    const query = document.getElementById("search-input").value.toLowerCase();
    notesContainer.innerHTML = "";

    // Check if the note is in trash or normal notes
    const allNotes = [...notes, ...trash];
    allNotes.forEach(function(note, index) {
        if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
            const noteElement = document.createElement("div");
            noteElement.className = "note-card p-4 rounded shadow"; // Apply the same style

            noteElement.innerHTML = `
                <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
                <div class="mb-4">${note.content}</div>
                <div class="text-gray-500 text-sm">${note.timestamp ? moment(note.timestamp).format('LLL') : 'Deleted on: ' + moment(note.timestamp).format('LLL')}</div>
                <div class="flex space-x-2 mt-4">
                    ${trash.includes(note) ? 
                        `<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 restore-note">Restore</button>
                         <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 delete-note-permanently">Delete Permanently</button>` : 
                        `<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 edit-note">Edit</button>
                         <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 pin-note">Archive</button>
                         <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 delete-note">Delete</button>`
                    }
                </div>
            `;

            // Handle Restore for trash
            if (trash.includes(note)) {
                noteElement.querySelector('.restore-note').addEventListener('click', () => restoreNote(index));
                noteElement.querySelector('.delete-note-permanently').addEventListener('click', () => permanentlyDelete(index));
            } else {
                noteElement.querySelector('.edit-note').addEventListener('click', () => editNote(index));
                noteElement.querySelector('.delete-note').addEventListener('click', () => deleteNoteToTrash(index));
                noteElement.querySelector('.pin-note').addEventListener('click', () => archiveNote(index));
            }

            notesContainer.appendChild(noteElement);
        }
    });
}


// Add event listener to the search input
document.getElementById("search-input").addEventListener("input", searchNotes);

// Add Note
function addNote() {
    const title = noteTitleInput.value.trim();
    const content = quill.root.innerHTML;
    const color = noteColor.value;
    const emoji = noteEmoji.value;
    const reminder = reminderInput.value;

    if (!title || !content.trim()) {
        Swal.fire('Error', 'Both title and content are required!', 'error');
        return;
    } else {
        Swal.fire({
            title: "The note has already been saved",
            icon: "success",
            draggable: true
          });
    }

    const newNote = {
        title,
        content,
        color,
        emoji,
        timestamp: new Date().toISOString(),
        archived: false,
    };

    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    clearInputs();
    renderNotes();
    setReminder(title, reminder);
    hideModal();
}

// Edit Note
function editNote(index) {
    const note = notes[index];
    noteTitleInput.value = note.title;
    quill.root.innerHTML = note.content;
    noteColor.value = note.color;
    noteEmoji.value = note.emoji;

    // Remove the note to avoid duplication
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    showModal();
}

// Clear Input Fields
function clearInputs() {
    noteTitleInput.value = '';
    quill.root.innerHTML = '';
    noteColor.value = 'bg-white';
    noteEmoji.value = '';
    reminderInput.value = '';
}

/*-------------------------------------------------Delete note-------------------------------------------------- */

// Move note to trash
function deleteNoteToTrash(index) {
    const deletedNote = notes.splice(index, 1)[0];
    trash.push(deletedNote);
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("trash", JSON.stringify(trash));
    renderNotes();
}

// Restore note from trash
function restoreNote(index) {
    const restoredNote = trash.splice(index, 1)[0];
    notes.push(restoredNote);
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("trash", JSON.stringify(trash));
    renderTrash();
}

// Permanently delete note
function permanentlyDelete(index) {
    trash.splice(index, 1);
    localStorage.setItem("trash", JSON.stringify(trash));
    renderTrash();
}
/* ---------------------------------------------Archive note--------------------------------------------*/
// Initialization of Archive
const archive = JSON.parse(localStorage.getItem('archive')) || [];

// Archive Note
function archiveNote(index) {
    const archivedNote = notes.splice(index, 1)[0];
    archivedNote.archived = true;
    archive.push(archivedNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('archive', JSON.stringify(archive));
    Swal.fire('Archived!', 'Your note has been archived.', 'success');
    renderNotes();
    renderArchive();
}

// Render Archive
function renderArchive() {
    const archiveContainer = document.getElementById('archive-container');
    archiveContainer.innerHTML = '';

    if (archive.length === 0) {
        archiveContainer.innerHTML = '<p>No archived notes available.</p>';
        return;
    }

    archive.forEach(function(note, index) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card p-4 rounded shadow';

        noteElement.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
            <div class="mb-4">${note.content}</div>
            <p class="text-gray-500 text-sm">Archived on: ${moment(note.timestamp).format('LLL')}</p>
            <div class="flex space-x-2 mt-4">
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 restore-note">Restore</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 delete-note-permanently">Delete Permanently</button>
            </div>
        `;

        // Handle Restore from Archive
        noteElement.querySelector('.restore-note').addEventListener('click', () => restoreNoteFromArchive(index));

        // Handle Permanent Delete from Archive
        noteElement.querySelector('.delete-note-permanently').addEventListener('click', () => permanentlyDeleteFromArchive(index));

        archiveContainer.appendChild(noteElement);
    });
}

// Restore Note from Archive
function restoreNoteFromArchive(index) {
    const restoredNote = archive.splice(index, 1)[0];
    notes.push(restoredNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('archive', JSON.stringify(archive));
    renderNotes();
    renderArchive();
}

// Permanently Delete from Archive
function permanentlyDeleteFromArchive(index) {
    archive.splice(index, 1);
    localStorage.setItem('archive', JSON.stringify(archive));
    renderArchive();
}

// Update Sidebar to Include Archive
function showArchive() {
    document.getElementById('archive-container').style.display = 'block';
    renderArchive();
}

// Add to Sidebar - Show Archive
document.querySelector('a[href="#"]').addEventListener('click', showArchive);


// // Render Notes
// function renderNotes() {
//     notesContainer.innerHTML = '';
//     notes.forEach((note, index) => {
//         const noteCard = document.createElement('div');
//         noteCard.className = `note-card p-4 rounded shadow ${note.color || 'bg-white'}`;
//         noteCard.innerHTML = `
//             <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
//             <div class="mb-4">${note.content}</div>
//             <p class="text-gray-500 text-sm">Created: ${moment(note.timestamp).format('LLL')}</p>
//             <div class="flex space-x-2 mt-4">
//                 <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 edit-note">Edit</button>
//                 <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 pin-note">Archive</button>
//                 <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 delete-note">Delete</button>
//             </div>
//         `;

//         // Handle delete
//         // noteCard.querySelector('.delete-note').addEventListener('click', () => deleteNote(index));
//         noteCard.querySelector('.delete-note').addEventListener('click', () => deleteNoteToTrash(index));

//         // Handle pin
//         noteCard.querySelector('.pin-note').addEventListener('click', () => archiveNote(index));

//         // Handle edit
//         noteCard.querySelector('.edit-note').addEventListener('click', () => editNote(index));


//         // Handle Archive
//         noteCard.querySelector('.pin-note').addEventListener('click', () => archiveNote(index));

//         // Handle save as PDF
//         noteCard.querySelector('.save-note').addEventListener('click', () => saveNoteAsPDF(note));

//         notesContainer.appendChild(noteCard);
//     });
// }   



// Render Notes
function renderNotes() {
    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.color} p-4 rounded shadow`; 

        noteCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${note.emoji || ''} ${note.title}</h2>
            <div class="mb-4">${note.content}</div>
            <p class="text-gray-500 text-sm">Created: ${moment(note.timestamp).format('LLL')}</p>
            <div class="flex space-x-2 mt-4">
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 edit-note">Edit</button>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600 pin-note">Archive</button>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-red-600 delete-note">Delete</button>
            </div>
        `;

        // Handle Delete
        noteCard.querySelector('.delete-note').addEventListener('click', () => deleteNoteToTrash(index));

        // Handle Archive
        noteCard.querySelector('.pin-note').addEventListener('click', () => archiveNote(index));

        // Handle Edit
        noteCard.querySelector('.edit-note').addEventListener('click', () => editNote(index));

        notesContainer.appendChild(noteCard);
    });
}


/*--------------------------Save note as PDF-------------------------------*/

// Save Note as PDF
function saveNoteAsPDF() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').innerText.trim();

    if (!title && !content) {
        Swal.fire('Error', 'Please fill in the note title or content before saving as PDF.', 'error');
        return;
    }

    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add title to the PDF
    pdf.setFontSize(18);
    pdf.text(title || 'Untitled Note', 10, 20);

    // Add content to the PDF
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(content, 180);
    pdf.text(lines, 10, 30);

    // Save the PDF
    const fileName = `${title || 'Untitled_Note'}.pdf`;
    pdf.save(fileName);
}

// Attach the function to the button
document.getElementById('save-pdf').addEventListener('click', saveNoteAsPDF); 

////searc api


////search api

async function searchAPI() {
    const query = document.getElementById('search').value;
    const resultsDiv = document.getElementById('results');
  
    if (!query.trim()) {
        resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }
  
    const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=activity&intitle=${encodeURIComponent(query)}&site=stackoverflow`;
  
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data.');
  
        const data = await response.json();
  
        if (data.items && data.items.length > 0) {
            resultsDiv.innerHTML = data.items
                .map(
                    item => `
                        <div>
                            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                            <p>Author: ${item.owner.display_name}</p>
                        </div>
                        <hr>
                    `
                )
                .join('');
        } else {
            resultsDiv.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }



  /////Button active 
  function setActive(element) {
    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.category a');
    buttons.forEach(button => button.classList.remove('active'));

    // Add 'active' class to the clicked button
    element.classList.add('active');
}