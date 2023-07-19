// Open the IndexedDB database
const dbName = 'imageDB';
const dbVersion = 1;
const imageStoreName = 'images';

let db;
const request = indexedDB.open(dbName, dbVersion);

request.onerror = (event) => {
    console.error("IndexedDB error:", event.target.error);
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("IndexedDB opened successfully!");
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(imageStoreName)) {
        db.createObjectStore(imageStoreName, { autoIncrement: true });
    }
};

// Save image to IndexedDB
var saveImageDB = function (imageInputId, imageId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(imageInputId);
        console.log("saveImageDB");
        console.log(fileInput)
        const file = fileInput.files[0];

        if (!file || imageId === '') {
            alert("Please select an image and provide an Image ID first!");
            reject("Image or ID missing");
            return;
        }

        const transaction = db.transaction(imageStoreName, 'readwrite');
        const imageStore = transaction.objectStore(imageStoreName);
        const imageObject = { id: imageId, data: "fake" };

        const addRequest = imageStore.put(imageObject);

        addRequest.onsuccess = () => {
            console.log(`Image with ID ${imageId} saved to IndexedDB successfully!`);
            resolve(imageId);
        };

        addRequest.onerror = (event) => {
            console.error("Error saving image to IndexedDB:", event.target.error);
            reject("Error saving image to IndexedDB");
        };
        /*
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageBlob = event.target.result;
                    const imageObject = { id: imageId, data: imageBlob };

                    const addRequest = imageStore.put(imageObject);

                    addRequest.onsuccess = () => {
                        console.log(`Image with ID ${imageId} saved to IndexedDB successfully!`);
                        resolve(imageId);
                    };

                    addRequest.onerror = (event) => {
                        console.error("Error saving image to IndexedDB:", event.target.error);
                        reject("Error saving image to IndexedDB");
                    };
                };

                reader.readAsArrayBuffer(file);
                */
    });
}

function getImageById(imageId) {
    const transaction = db.transaction(imageStoreName, 'readonly');
    const imageStore = transaction.objectStore(imageStoreName);

    const getRequest = imageStore.get(imageId);

    getRequest.onsuccess = (event) => {
        const imageObject = event.target.result;

        if (imageObject) {
            const imageBlob = imageObject.data;
            const imageUrl = URL.createObjectURL(new Blob([imageBlob], { type: 'image/jpeg' }));

            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.style.maxWidth = '200px';

            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = '';
            imageContainer.appendChild(imageElement);
        } else {
            alert(`Image with ID ${imageId} not found in IndexedDB.`);
        }
    };

    getRequest.onerror = (event) => {
        console.error("Error retrieving image from IndexedDB:", event.target.error);
    };
}

function deleteImageById(imageId) {
    const transaction = db.transaction(imageStoreName, 'readwrite');
    const imageStore = transaction.objectStore(imageStoreName);

    const deleteRequest = imageStore.delete(imageId);

    deleteRequest.onsuccess = () => {
        console.log(`Image with ID ${imageId} deleted from IndexedDB successfully!`);
        displayImages();
    };

    deleteRequest.onerror = (event) => {
        console.error("Error deleting image from IndexedDB:", event.target.error);
    };
}