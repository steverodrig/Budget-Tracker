let db;

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("transaction", { autoIncrement: true });
};

request.onsuccess = event => {
    console.log(request.result.name);
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Uh-oh! " + event.target.errorCode);
};

function saveRecord(record) {
    
    const transaction = db.transaction(["transaction"], "readwrite");
  
    const store = transaction.objectStore("transaction");

    // add record to your store with add method.
    store.add(record);
}

function checkDatabase() {
    
    const transaction = db.transaction(["transaction"], "readwrite");
    
    const store = transaction.objectStore("transaction");
   
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          
          const transaction = db.transaction(["pending"], "readwrite");
    
          const store = transaction.objectStore("pending");
  
          store.clear();
        });
      }
    };
  }
