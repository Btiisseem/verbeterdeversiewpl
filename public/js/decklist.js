const addButton = document.getElementById('add-deck-btn');
const deckNameInput = document.getElementById('deck-name-input');
const saveButton = document.getElementById('save-deck-btn');
const popupContainer = document.getElementById('popup-container');
const container = document.getElementById('deck-image-container');
const updatePopupContainer = document.getElementById('update-popup-container');
const updateDeckNameInput = document.getElementById('update-deck-name-input');
const updateSaveButton = document.getElementById('update-save-deck-btn');
const updateContainer = document.getElementById('update-deck-image-container');
const closeUpdatePopupButton = document.getElementById('close-update-popup');
const closePopupButton = document.querySelector('.close-the-popup');
let selectedDeckId = null;
let selectedDeckImage = null;

const imageUrls = {
  achterkantdraak: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantdraak.jpg", 
  achterkantmixthemas: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantmixthemas.jpg", 
  achterkantmixthemas2: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantmixthemas2.jpg", 
  achterkantorigineel: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantorigineel.jpg", 
  achterkantvrouw: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantvrouw.jpg", 
  achterkantvuurman: "https://raw.githubusercontent.com/Btiisseem/projectwpl/main/public/assets/images/achterkantvuurman.jpg", 
};

closePopupButton.addEventListener('click', () => {  
  popupContainer.classList.add('hidden'); 
}); 

addButton.addEventListener('click', () => {
    popupContainer.classList.remove('hidden');
    container.innerHTML = ''; 
    Object.entries(imageUrls).forEach(([name, url]) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = name;
      img.classList.add('deck-image'); 
      img.classList.add('popup-deck-image'); 
      img.addEventListener('click', () => {
        selectImage(url);
      });
      container.appendChild(img);
    });
});

function selectImage(selectedUrl) {
    document.querySelectorAll('.deck-image').forEach(img => {
      if (img.src !== selectedUrl) {
        img.classList.add('hidden');
      } else {
        img.classList.add('selected');
        deckNameInput.classList.remove('hidden');
        deckNameInput.classList.add('deckname-input');
        saveButton.classList.remove('hidden');
        saveButton.classList.add('save-button');
      }
    });
}

saveButton.addEventListener('click', async () => {
    const selectedImage = document.querySelector('.selected');
    if (selectedImage && deckNameInput.value) {
      const deckData = {
        name: deckNameInput.value,
        imageUrl: selectedImage.src
      };

      try {
        const response = await fetch('/decklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        });
        if (response.ok) {
          popupContainer.classList.add('hidden');
          deckNameInput.classList.add('hidden');
          saveButton.classList.add('hidden');
          location.reload();
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Selecteer een afbeelding en voer een decknaam in.');
    }
});

document.querySelectorAll('.update-deck-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        selectedDeckId = e.target.getAttribute('data-id');
        const deckName = e.target.getAttribute('data-name');
        const deckImage = e.target.getAttribute('data-image');
        updateDeckNameInput.value = deckName;
        updatePopupContainer.classList.remove('hidden');
        updateContainer.innerHTML = ''; 
        Object.entries(imageUrls).forEach(([name, url]) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = name;
            img.classList.add('deck-image'); 
            img.classList.add('popup-deck-image'); 
            if (url === deckImage) {
                img.classList.add('selected');
            }
            img.addEventListener('click', () => {
                selectUpdateImage(url);
            });
            updateContainer.appendChild(img);
        });
    });
});

function selectUpdateImage(selectedUrl) {
    selectedDeckImage = selectedUrl;
    document.querySelectorAll('#update-deck-image-container .deck-image').forEach(img => {
      if (img.src !== selectedUrl) {
        img.classList.add('hidden');
      } else {
        img.classList.add('selected');
        updateDeckNameInput.classList.remove('hidden');
        updateDeckNameInput.classList.add('deckname-input');
        updateSaveButton.classList.remove('hidden');
        updateSaveButton.classList.add('save-button');
      }
    });
}

updateSaveButton.addEventListener('click', async () => {
    if (selectedDeckImage && updateDeckNameInput.value) {
      const deckData = {
        deckId: selectedDeckId,
        name: updateDeckNameInput.value,
        imageUrl: selectedDeckImage
      };

      try {
        const response = await fetch('/deckdetail/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        });
        if (response.ok) {
          updatePopupContainer.classList.add('hidden');
          alert('Bevestigd: "' + updateDeckNameInput.value + '"');  
          location.reload();
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Selecteer een afbeelding en voer een decknaam in.');
    }
});

closeUpdatePopupButton.addEventListener('click', () => {
    updatePopupContainer.classList.add('hidden');
});

document.querySelectorAll('.delete-deck-btn-decklist').forEach(form => {
  form.addEventListener('submit', function(event) {
    const confirmation = confirm('Bent u zeker dat u deze deck wilt verwijderen?');
    if (!confirmation) {
      event.preventDefault(); 
    }
  });
});
