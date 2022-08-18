let db;
const firstNameInput = document.querySelector('#firstName');
const lastNameInput = document.querySelector('#lastName');
const form = document.querySelector('form');
const list = document.querySelector('ul');

window.onload = () => {
  let request = window.indexedDB.open('contacts', 1);

  request.onerror = function () {
    console.log('Database failed to open');
  };

  request.onsuccess = function () {
    console.log('Database opened successfully');

    db = request.result;
    displayData();
  };

  request.onupgradeneeded = function (e) {
    let db = e.target.result;

    let objectStore = db.createObjectStore('contacts', {
      keyPath: 'id',
      autoIncrement: true,
    });

    objectStore.createIndex('firstName', 'firstName', {
      unique: false,
    });
    objectStore.createIndex('lastName', 'lastName', {
      unique: false,
    });

    console.log('Database setup complete');
  };

  form.onsubmit = addData;

  function addData(e) {
    e.preventDefault();

    let newItem = {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
    };

    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    let request = objectStore.add(newItem);

    request.onsuccess = () => {
      firstNameInput.value = '';
      lastNameInput.value = '';
    };

    transaction.oncomplete = () => {
      console.log('Transaction completed on the database');
      displayData();
    };

    transaction.onerror = () => {
      console.log('Transaction not completed, error!!!');
    };
  }

  function displayData() {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    let objectStore = db
      .transaction('contacts')
      .objectStore('contacts');
    objectStore.openCursor().onsuccess = function (e) {
      let cursor = e.target.result;

      if (cursor) {
        let listItem = document.createElement('li');
        let first = document.createElement('p');
        let last = document.createElement('p');

        listItem.appendChild(first);
        listItem.appendChild(last);
        list.appendChild(listItem);

        first.textContent = cursor.value.firstName;
        last.textContent = cursor.value.lastName;

        listItem.setAttribute('data-contact-id', cursor.value.id);

        let deleteButton = document.createElement('button');
        listItem.appendChild(deleteButton);
        deleteButton.textContent = 'Delete';

        deleteButton.onclick = deleteItem;

        cursor.continue();
      } else {
        if (!list.firstChild) {
          let listItem = document.createElement('li');
          listItem.textContent = 'No contacts store.';
          list.appendChild(listItem);
        }
      }
      console.log('Contacts displayed!!!');
    };
  }

  function deleteItem(e) {
    let contactId = Number(
      e.target.parentNode.getAttribute('data-contact-id')
    );

    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    let request = objectStore.delete(contactId);

    transaction.oncomplete = () => {
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);

      console.log(`Contact ${contactId} is deleted`);

      if (!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent = 'No contacts store.';
        list.appendChild(listItem);
      }
    };
  }
};
