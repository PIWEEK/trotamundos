/////// DB ///////
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
        db.createObjectStore(imageStoreName, { keyPath: 'id' });
    }
};

function saveImageDB(imageInputId, imageId, callback) {
    const element = document.getElementById(imageInputId);
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        saveImageDB2(reader.result, imageId, callback)
    }
    reader.readAsDataURL(file);
}


function saveImageDB2(data, imageId, callback) {
    const transaction = db.transaction(imageStoreName, 'readwrite');
    const imageStore = transaction.objectStore(imageStoreName);

    const imageObject = { id: imageId, data: data };
    const addRequest = imageStore.add(imageObject);

    addRequest.onsuccess = (event) => {
        console.log("Image saved to IndexedDB successfully!");
        hideLoader();
        callback();
    };

    addRequest.onerror = (event) => {
        hideLoader();
        alert("Error guardando la imagen");
        console.error("Error saving image to IndexedDB:", event.target.error);
    };
}

function loadImageFromDB(imageId, targetImage) {
    db
        .transaction(imageStoreName, 'readonly')
        .objectStore(imageStoreName)
        .get(imageId).onsuccess = (event) => {
            var imageObject = event.target.result;
            console.log("Imageobject", imageObject);

            var imageElement = document.getElementById(targetImage);
            imageElement.src = imageObject.data;
            if (imageElement.naturalWidth > imageElement.naturalHeight) {
                imageElement.classList.add("landscape");
                imageElement.classList.remove("portrait");
            } else {
                imageElement.classList.remove("landscape");
                imageElement.classList.add("portrait");
            }
        };
}

function deleteImageById(imageId) {
    const transaction = db.transaction(imageStoreName, 'readwrite');
    const imageStore = transaction.objectStore(imageStoreName);

    const deleteRequest = imageStore.delete(imageId);

    deleteRequest.onsuccess = () => {
        console.log(`Image with ID ${imageId} deleted from IndexedDB successfully!`);
    };

    deleteRequest.onerror = (event) => {
        console.error("Error deleting image from IndexedDB:", event.target.error);
    };
}
///////////////////////////////////////////////////////////////////////////////////











////////////////////
var tripsList = {};
var currentTripId = null;
var currentSectionId = null;
var currentSection = null;

var sectionsSortable = null;
var sortedSections = [];

if (localStorage.tripsList) {
    tripsList = JSON.parse(localStorage.tripsList);
}

////////////////////

function save() {
    localStorage.tripsList = JSON.stringify(tripsList);
}

function getSection(trip, sectionId) {
    for (var i = 0; i < trip.sections.length; i++) {
        if (sectionId == trip.sections[i].id) {
            return trip.sections[i];
        }
    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function formatDate(strDate) {
    let date = new Date(strDate)
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = `0${month}`;
    }

    return `${day}/${month}/${year}`;
}

function showLoader(){
    document.getElementById("loader").classList.remove("hidden");
}

function hideLoader(){
    document.getElementById("loader").classList.add("hidden");
}

function initTripsSortable(tripsContainer) {
    Sortable.create(tripsContainer, {
        animation: 150,
        draggable: '.draggable',
        handle: '.icon',
        dragoverBubble: true,
    });

}

function initSectionsSortable(sectionsContainer) {
    if (sectionsSortable != null) {
        sectionsSortable.destroy();
    }

    sectionsSortable = Sortable.create(sectionsContainer, {
        animation: 150,
        draggable: '.draggable',
        handle: '.icon',
        dragoverBubble: true,
        onEnd: updateSectionOrder
    });
}

function updateSectionOrder() {
    console.log('updating...')
    var sections = document.getElementsByClassName('section-item');
    var trip = tripsList[currentTripId];
    var sectionId;
    for (var i = 0; i < sections.length; i++) {
        sectionId = sections[i].dataset.sectionId;
        trip.sections[sectionId].pos = i;
    }
    save()
}


function openControls() {
    document.getElementById('ctrl-plus').classList.add('hidden');

    document.getElementById('ctrl-text').classList.remove('hidden');
    document.getElementById('ctrl-image').classList.remove('hidden');
    document.getElementById('ctrl-cancel').classList.remove('hidden');
    document.getElementById('ctrl-subtitle').classList.remove('hidden');
    document.getElementById('ctrl-gpx').classList.remove('hidden');

    document.getElementById('controls').classList.add('open');
}

function closeControls() {
    document.getElementById('ctrl-plus').classList.remove('hidden');

    document.getElementById('ctrl-text').classList.add('hidden');
    document.getElementById('ctrl-image').classList.add('hidden');
    document.getElementById('ctrl-cancel').classList.add('hidden');
    document.getElementById('ctrl-subtitle').classList.add('hidden');
    document.getElementById('ctrl-gpx').classList.add('hidden');

    document.getElementById('controls').classList.remove('open');
}

function openSectionMenu() {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('section-menu').classList.remove('hidden');
}

function openTripMenu() {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('trip-menu').classList.remove('hidden');
}

function openHomeMenu() {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('home-menu').classList.remove('hidden');
}

function closeMenu() {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('trip-menu').classList.add('hidden');
    document.getElementById('section-menu').classList.add('hidden');
    document.getElementById('home-menu').classList.add('hidden');
}



function confirmDeleteTrip() {
    if (confirm("¿Seguro que quieres borrar este viaje?") == true) {
        var trip = tripsList[currentTripId];
        var sections = Object.values(trip.sections);
        for (var i = 0; i < sections.length; i++) {
            if ("image" == sections[i].type) {
                deleteImageById(sections[i].imageId);
            }
        }
        delete tripsList[currentTripId];
        save();
        goHome();
    }
    closeMenu();
}

function confirmDeleteSection() {
    if (confirm("\u00BFSeguro que quieres borrar esta secci\u00F3n?") == true) {
        var trip = tripsList[currentTripId];
        var section = trip.sections[currentSectionId];
        if ("image" == section.type) {
            deleteImageById(section.imageId);
        }

        delete trip.sections[currentSectionId];
        reloadSections(trip.sections);
        updateSectionOrder();
        openViewTrip();
    }
    closeMenu();
}

function initTripControls() {
    document.getElementById('ctrl-plus').addEventListener('click', openControls, false);
    document.getElementById('ctrl-cancel').addEventListener('click', closeControls, false);
    document.getElementById('ctrl-text').addEventListener('click', openEditText, false);
    document.getElementById('ctrl-image').addEventListener('click', openEditImage, false);
    document.getElementById('ctrl-subtitle').addEventListener('click', openEditSubtitle, false);

    document.getElementById('go-home').addEventListener('click', goHome, false);
    document.getElementById('trip-menu-icon').addEventListener('click', openTripMenu, false);
    document.getElementById('overlay').addEventListener('click', closeMenu, false);

    document.getElementById('preview-trip').addEventListener('click', previewTrip, false);
    document.getElementById('delete-trip').addEventListener('click', confirmDeleteTrip, false);

    document.getElementById('trip-title').addEventListener('click', openEditTrip, false);


}

function previewTrip() {
    closeMenu();
    var trip = tripsList[currentTripId];
    reloadPreviewSections(trip.sections);
    document.getElementById('preview-post-title').innerText = trip.name
    document.getElementById('preview-post-date').innerText = formatDate(trip.date)
    document.getElementById('trotamundos-editor').classList.add('hidden');
    document.getElementById('trotamundos-preview').classList.remove('hidden');
    document.body.style.backgroundColor = "white";
}

function initServiceWorker() {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(res => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered', err));
}

function reloadTrip(data) {
    trip = document.createElement('div');
    trip.classList.add('draggable');


    image = document.createElement('img');
    image.classList.add('icon');
    image.src = 'icons/trotamundos.png'
    trip.appendChild(image);

    title = document.createElement('div');
    title.classList.add('container');
    title.classList.add('text-container');
    title.dataset.tripId = data.id;
    title.addEventListener('click', openViewTripEv, false);

    tripName = document.createElement('div');
    tripName.classList.add('text-title');
    tripName.innerHTML = data.name;

    tripDate = document.createElement('div');
    tripDate.classList.add('date-title');
    var date = formatDate(data.date);
    if (data.date2 != null){
        date += " - " + formatDate(data.date2);
    }
    tripDate.innerHTML = date;


    title.appendChild(tripName);
    title.appendChild(tripDate);
    trip.appendChild(title);

    document.getElementById('trips-container').appendChild(trip);
}

function reloadTrips() {
    console.log("reloadTrips")
    var tripsContainer = document.getElementById('trips-container');
    while (tripsContainer.firstChild) {
        tripsContainer.removeChild(tripsContainer.firstChild);
    }

    Object.values(tripsList).forEach(reloadTrip);

    initTripsSortable(tripsContainer);
}

function goHome() {
    currentTripId = null;
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.add('hidden');
    reloadTrips();
    document.getElementById('home-screen').classList.remove('hidden');
}


function goBack() {
    if (currentTripId == null) {
        goHome();
    } else {
        openViewTrip(currentTripId);
    }
}



function openViewTripEv(ev) {
    openViewTrip(ev.currentTarget.dataset.tripId);
}

function reloadSection(data) {

    section = document.createElement('div');
    section.dataset.sectionId = data.id;
    section.classList.add('draggable');
    section.classList.add('section-item');
    img = document.createElement('img');
    img.classList.add('icon');

    if ('text' == data.type) {
        img.src = 'icons/font.png';
        text = document.createElement('div');
        text.classList.add('container');
        text.classList.add('text-container');
        text.innerText = data.text;

        text.dataset.sectionId = data.id;
        text.addEventListener('click', openEditTextEv, false);

        section.appendChild(img);
        section.appendChild(text);
    } else if ('image' == data.type) {
        img.src = 'icons/photo.png';
        image = document.createElement('div');
        image.classList.add('container');
        image.classList.add('gallery-container');

        photo = document.createElement('img');
        photo.id = 'photo-' + data.imageId;

        image.appendChild(photo);


        image.dataset.sectionId = data.id;
        image.addEventListener('click', openEditImageEv, false);

        section.appendChild(img);
        section.appendChild(image);
        loadImageFromDB(data.imageId, photo.id);
    } else if ('subtitle' == data.type) {
        img.src = 'icons/title.png';
        text = document.createElement('div');
        text.classList.add('container');
        text.classList.add('text-container');
        text.innerText = data.subtitle;

        text.dataset.sectionId = data.id;
        text.addEventListener('click', openEditSubtitleEv, false);

        section.appendChild(img);
        section.appendChild(text);
    }
    console.log(data.type);
    document.getElementById('sections-container').appendChild(section);
}

function reloadSections(sections) {
    var sectionsContainer = document.getElementById('sections-container');

    while (sectionsContainer.firstChild) {
        sectionsContainer.removeChild(sectionsContainer.firstChild);
    }

    sortedSections = Object.values(sections)
    sortedSections.sort((a, b) => a.pos - b.pos);

    sortedSections.forEach(reloadSection);

    initSectionsSortable(sectionsContainer);
}

function openViewTrip(tripId) {
    closeControls();
    currentSectionId = null;

    if (tripId) {
        currentTripId = tripId;
    } else {
        tripId = currentTripId;
    }

    var trip = tripsList[tripId];


    document.getElementById('detail-trip-name').innerHTML = trip.name;
    reloadSections(trip.sections);

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('trip-screen').classList.remove('hidden');
    document.getElementById('section-screen').classList.add('hidden');
}


function openEditTrip() {
    var trip;
    currentSection = "trip";
    if (currentTripId == null) {
        document.getElementById('section-title').innerHTML = 'Nuevo viaje';
        document.getElementById('trip-name').value = '';
        document.getElementById('trip-date').valueAsDate = new Date();
        document.getElementById('trip-id').value = uuidv4();
        document.getElementById('trip-theme').selectedIndex = 0;
    } else {
        trip = tripsList[currentTripId];
        document.getElementById('section-title').innerHTML = trip.name;
        document.getElementById('trip-name').value = trip.name;
        document.getElementById('trip-date').value = trip.date;
        document.getElementById('trip-date2').value = trip.date2;
        document.getElementById('trip-id').value = trip.id;
        document.getElementById('trip-theme').value = trip.theme;
    }

    document.getElementById('section-icon').src = 'icons/trotamundos.png';
    openSection('section-trip-data');
}

function saveSection() {
    console.log("saveSection");
    switch (currentSection) {
        case 'trip':
            saveTrip();
            break;
        case 'text':
            saveText();
            break;
        case 'image':
            saveImage();
            break;
        case 'subtitle':
            saveSubtitle();
            break;
    }
}

function saveTrip() {
    if (document.getElementById('section-trip-data').checkValidity()) {
        var trip;
        if (currentTripId != null) {
            trip = tripsList[currentTripId];
        } else {
            trip = { sections: {} };
        }

        trip.id = document.getElementById('trip-id').value;
        trip.name = document.getElementById('trip-name').value;
        trip.date = document.getElementById('trip-date').value;
        trip.date2 = document.getElementById('trip-date2').value;
        trip.theme = document.getElementById('trip-theme').value;

        tripsList[trip.id] = trip;
        save();
        openViewTrip(trip.id);
    } else {
        document.getElementById('section-trip-data').reportValidity();
    }
}

function saveText() {
    if (document.getElementById('section-text').checkValidity()) {
        var trip = tripsList[currentTripId];
        var section;
        if (currentSectionId != null) {
            section = trip.sections[currentSectionId];
        } else {
            section = { id: uuidv4(), type: "text", pos: Object.keys(trip.sections).length };
        }

        section.text = document.getElementById('trip-text').value;




        trip.sections[section.id] = section;
        tripsList[trip.id] = trip;
        save();

        openViewTrip(trip.id);
    } else {
        document.getElementById('section-text').reportValidity();
    }
}

function saveImage() {
    if (document.getElementById('section-image').checkValidity()) {
        showLoader();
        var trip = tripsList[currentTripId];
        var section;
        if (currentSectionId != null) {
            section = trip.sections[currentSectionId];
        } else {
            section = { id: uuidv4(), type: "image", pos: Object.keys(trip.sections).length };
        }


        var oldImageId = section.imageId;
        var imageId = uuidv4();
        section.imageId = imageId;

        trip.sections[section.id] = section;
        tripsList[trip.id] = trip;
        save();

        //Delete old image
        if (oldImageId != null) {
            deleteImageById(oldImageId);
        }
        saveImageDB('trip-image', imageId, openViewTrip);


    } else {
        document.getElementById('section-image').reportValidity();
    }
}

function saveSubtitle() {
    if (document.getElementById('section-subtitle').checkValidity()) {
        var trip = tripsList[currentTripId];
        var section;
        if (currentSectionId != null) {
            section = trip.sections[currentSectionId];
        } else {
            section = { id: uuidv4(), type: "subtitle", pos: Object.keys(trip.sections).length };
        }

        section.subtitle = document.getElementById('trip-subtitle').value;

        trip.sections[section.id] = section;
        tripsList[trip.id] = trip;
        save();

        openViewTrip(trip.id);
    } else {
        document.getElementById('section-subtitle').reportValidity();
    }
}




function openSection(sectionId) {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.remove('hidden');


    document.getElementById('section-text').classList.add('hidden');
    document.getElementById('section-image').classList.add('hidden');
    document.getElementById('section-subtitle').classList.add('hidden');
    document.getElementById('section-trip-data').classList.add('hidden');

    document.getElementById(sectionId).classList.remove('hidden');
}

function openEditTextEv(ev) {
    currentSectionId = ev.currentTarget.dataset.sectionId;
    openEditText();
}

function findTitle(){
    var title = tripsList[currentTripId].name;
    console.log(sortedSections);
    for (var i=0; i<sortedSections.length;i++){
        if ("subtitle" == sortedSections[i].type){
            title = "... / " + sortedSections[i].subtitle;
        }
        if (sortedSections[i].id == currentSectionId){
            break;
        }
    }
    return title;
}

function openEditText() {
    currentSection = "text";
    var trip = tripsList[currentTripId];
    if (currentSectionId == null) {
        document.getElementById('trip-text').value = '';
        document.getElementById('section-menu-icon').classList.add('hidden');
    } else {
        document.getElementById('trip-text').value = trip.sections[currentSectionId].text;
        document.getElementById('section-menu-icon').classList.remove('hidden');
    }

    document.getElementById('section-title').innerHTML = findTitle();
    document.getElementById('section-icon').src = 'icons/font.png';
    openSection('section-text');
}



function openEditImageEv(ev) {
    currentSectionId = ev.currentTarget.dataset.sectionId;
    openEditImage();
}

function openEditImage() {
    currentSection = "image";
    var trip = tripsList[currentTripId];

    if (currentSectionId == null) {
        document.getElementById('trip-image').value = '';
        document.getElementById('trip-image-preview').src = 'icons/photo-placeholder.png';
        document.getElementById('section-menu-icon').classList.add('hidden');
    } else {
        section = trip.sections[currentSectionId]
        loadImageFromDB(section.imageId, 'trip-image-preview');
        document.getElementById('section-menu-icon').classList.remove('hidden');
    }

    document.getElementById('section-title').innerHTML = findTitle();
    document.getElementById('section-icon').src = 'icons/photo.png';

    openSection('section-image');
}


function openEditSubtitleEv(ev) {
    currentSectionId = ev.currentTarget.dataset.sectionId;
    openEditSubtitle();
}

function openEditSubtitle() {
    currentSection = "subtitle";
    var trip = tripsList[currentTripId];
    if (currentSectionId == null) {
        document.getElementById('trip-subtitle').value = '';
        document.getElementById('section-menu-icon').classList.add('hidden');
    } else {
        document.getElementById('trip-subtitle').value = trip.sections[currentSectionId].subtitle;
        document.getElementById('section-menu-icon').classList.remove('hidden');
    }

    document.getElementById('section-title').innerHTML = trip.name;
    document.getElementById('section-icon').src = 'icons/title.png';
    openSection('section-subtitle');
}


function previewImage(ev) {
    handleImagePreview('trip-image', 'trip-image-preview');
}

function handleImagePreview(inputId, containerId) {
    const fileInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(containerId);
    console.log(inputId);
    console.log(fileInput);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const imageBlob = event.target.result;
            const imageUrl = URL.createObjectURL(new Blob([imageBlob], { type: 'image/jpeg' }));

            previewContainer.src = imageUrl;

        };

        reader.readAsArrayBuffer(file);
    } else {
        alert("Please select an image first!");
    }
}

function publish() {
    const formData = new FormData();
    formData.append("data", "hello world");

    fetch("/api/print", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}


async function clearCache() {
    try {
      // Open the cache
      const cache = await caches.open("trotamundos-v1");

      // Get all the cache keys (URLs)
      const cacheKeys = await cache.keys();

      // Delete each entry in the cache
      const deletePromises = cacheKeys.map(key => cache.delete(key));

      // Wait for all delete operations to complete
      await Promise.all(deletePromises);

      console.log('Cache cleared successfully.');
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

function sectionInputFocus(){
    document.getElementById('section-menu-icon').classList.add('hidden');
    document.getElementById('section-save-icon').classList.remove('hidden');
}
function sectionInputBlur(){
    setTimeout(() => {
        if (currentSectionId != null) {
            document.getElementById('section-menu-icon').classList.remove('hidden');
        }
        document.getElementById('section-save-icon').classList.add('hidden');
      }, 50);
}

function initHomeControls() {
    document.getElementById('add-trip').addEventListener('click', openEditTrip, false);
    document.getElementById('home-menu-icon').addEventListener('click', openHomeMenu, false);
    document.getElementById('home-publish').addEventListener('click', publish, false);
    document.getElementById('home-cache').addEventListener('click', clearCache, false);
}

function initSectionControls() {
    document.getElementById('section-save').addEventListener('click', saveSection, false);
    document.getElementById('section-save-icon').addEventListener('click', saveSection, false);
    document.getElementById('section-cancel').addEventListener('click', goBack, false);

    document.getElementById('trip-image').addEventListener('change', previewImage);
    document.getElementById('section-menu-icon').addEventListener('click', openSectionMenu, false);
    document.getElementById('delete-section').addEventListener('click', confirmDeleteSection, false);


    document.getElementById('trip-name').addEventListener('focus', sectionInputFocus);
    document.getElementById('trip-name').addEventListener('blur', sectionInputBlur);

    document.getElementById('trip-subtitle').addEventListener('focus', sectionInputFocus);
    document.getElementById('trip-subtitle').addEventListener('blur', sectionInputBlur);

    document.getElementById('trip-text').addEventListener('focus', sectionInputFocus);
    document.getElementById('trip-text').addEventListener('blur', sectionInputBlur);


}


function preventEnter() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(function (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
            }
        });
    });
}



window.onload = function (e) {
    initServiceWorker();

    initHomeControls();
    initTripControls();
    initSectionControls();
    initPreviewControls();
    preventEnter();

    goHome();
}



//////////////// PREVIEW /////////////////////

function initPreviewControls() {
    document.getElementById('preview-go-back').addEventListener('click', closePreview, false);
    document.getElementById('preview-to-pdf').addEventListener('click', previewToPdf, false);
}

function closePreview() {
    document.body.style.backgroundColor = "black";
    document.getElementById('trotamundos-preview').classList.add('hidden');
    document.getElementById('trotamundos-editor').classList.remove('hidden');
}



function reloadPreviewSection(data) {

    section = document.createElement('div');
    section.dataset.sectionId = data.id;

    if ('text' == data.type) {
        section.classList.add('preview-text');
        section.innerText = data.text;
    } else if ('image' == data.type) {
        section.classList.add('preview-image');
        photo = document.createElement('img');
        photo.id = 'preview-photo-' + data.imageId;
        section.appendChild(photo);
        loadImageFromDB(data.imageId, photo.id);
    } else if ('subtitle' == data.type) {
        section.classList.add('preview-subtitle');
        text = document.createElement('h2');
        text.innerText = data.subtitle;
        section.appendChild(text);
    }
    document.getElementById('preview-sections-container').appendChild(section);
}

function reloadPreviewSections(sections) {
    var sectionsContainer = document.getElementById('preview-sections-container');

    while (sectionsContainer.firstChild) {
        sectionsContainer.removeChild(sectionsContainer.firstChild);
    }

    var sections = Object.values(sections)
    sections.sort((a, b) => a.pos - b.pos);

    sections.forEach(reloadPreviewSection);
}




////////////// PDF ///////////////////////

window.jsPDF = window.jspdf.jsPDF;

function previewToPdf() {
    showLoader();
    const doc = new jsPDF();

    // Source HTMLElement or a string containing HTML.
    var elementHTML = document.getElementById('trotamundos-preview');

    doc.html(elementHTML, {
        callback: function (doc) {
            // Save the PDF
            doc.save(tripsList[currentTripId].name + '.pdf');
            hideLoader();
        },
        margin: [10, 10, 10, 10],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 190, //target width in the PDF document
        windowWidth: 1000 //window width in CSS pixels
    });
}