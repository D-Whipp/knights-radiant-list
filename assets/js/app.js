let db;
const firstNameInput = document.querySelector('#firstName');
const lastNameInput = document.querySelector('#lastName');
const form = document.querySelector('form');
const list = document.querySelector('ul');

window.onload = () => {
  let request = window.indexedDB.open('radiants', 1);

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

    let objectStore = db.createObjectStore('radiants', {
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

    let transaction = db.transaction(['radiants'], 'readwrite');
    let objectStore = transaction.objectStore('radiants');
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
      .transaction('radiants')
      .objectStore('radiants');
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

        listItem.setAttribute('data-radiant-id', cursor.value.id);

        let deleteButton = document.createElement('button');
        listItem.appendChild(deleteButton);
        deleteButton.textContent = 'Delete';

        deleteButton.onclick = deleteItem;

        cursor.continue();
      } else {
        if (!list.firstChild) {
          let listItem = document.createElement('li');
          listItem.textContent = 'No Radiants enlisted.';
          list.appendChild(listItem);
        }
      }
      console.log('radiants displayed!!!');
    };
  }

  function deleteItem(e) {
    let radiantId = Number(
      e.target.parentNode.getAttribute('data-radiant-id')
    );

    let transaction = db.transaction(['radiants'], 'readwrite');
    let objectStore = transaction.objectStore('radiants');
    let request = objectStore.delete(radiantId);

    transaction.oncomplete = () => {
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);

      console.log(`radiant ${radiantId} is deleted`);

      if (!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent = 'No radiants store.';
        list.appendChild(listItem);
      }
    };
  }
};
