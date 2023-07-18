const dbName = "traveler_db_01";

const request = indexedDB.open(dbName, 2);

request.onerror = (event) => {
    // Handle errors.
    console.log("====> Error on DB");
    console.log(error);
};
request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create an objectStore to hold information about our trips.
    const objectStore = db.createObjectStore("trips", { keyPath: "id" });


    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = (event) => {
        // Store values in the newly created objectStore.
        const tripsObjectStore = db
            .transaction("trips", "readwrite")
            .objectStore("trips");
        tripData.forEach((trip) => {
            tripObjectStore.add(trip);
        });
    };
};

function saveTrip(trip) {
    const transaction = db.transaction(["trips"], "readwrite");
    transaction.oncomplete = (event) => {
        console.log("All done!");
    };

    transaction.onerror = (event) => {
        // Don't forget to handle errors!
        console.log("====> Error on save trip");
        console.log(error);
    };

    const objectStore = transaction.objectStore("trips");

    const request = objectStore.add(trip);
    request.onsuccess = (event) => {
        // event.target.result === trip.ssn;
    };
}

function removeTrip(tripId) {
    const request = db
        .transaction(["trips"], "readwrite")
        .objectStore("trips")
        .delete(tripId);
    request.onsuccess = (event) => {
        // It's gone!
    };
}

function getTrip(tripId) {
    db
        .transaction("trips")
        .objectStore("trips")
        .get(tripId).onsuccess = (event) => {
            console.log(`Name for trip is ${event.target.result.name}`);
        };
}

function updateTrip(trip) {
    const objectStore = db
        .transaction(["trips"], "readwrite")
        .objectStore("trips");
    const request = objectStore.get(trip.id);
    request.onerror = (event) => {
        // Handle errors!
    };
    request.onsuccess = (event) => {
        // Get the old value that we want to update
        //const data = event.target.result;

        // update the value(s) in the object that you want to change
        //data.age = 42;

        // Put this updated object back into the database.
        const requestUpdate = objectStore.put(trip);
        requestUpdate.onerror = (event) => {
            // Do something with the error
        };
        requestUpdate.onsuccess = (event) => {
            // Success - the data is updated!
        };
    };
}
