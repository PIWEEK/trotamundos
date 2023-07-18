////////////////////
var tripsList = {};
var currentTripId = null;
var currentSectionId = null;
var currentSection = null;

if (localStorage.tripsList) {
    tripsList = JSON.parse(localStorage.tripsList);
}

////////////////////

function save() {
    localStorage.tripsList = JSON.stringify(tripsList);
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

function initTripsSortable(tripsContainer) {
    Sortable.create(tripsContainer, {
        animation: 150,
        draggable: '.draggable',
        handle: '.icon',
        dragoverBubble: true,
    });

}

function initSectionsSortable(sectionsContainer) {
    Sortable.create(sectionsContainer, {
        animation: 150,
        draggable: '.draggable',
        handle: '.icon',
        dragoverBubble: true,
    });
}


function openControls() {
    document.getElementById('ctrl-plus').classList.add('hidden');

    document.getElementById('ctrl-text').classList.remove('hidden');
    document.getElementById('ctrl-image').classList.remove('hidden');
    document.getElementById('ctrl-cancel').classList.remove('hidden');
    document.getElementById('ctrl-title').classList.remove('hidden');
    document.getElementById('ctrl-gpx').classList.remove('hidden');

    document.getElementById('controls').classList.add('open');
}

function closeControls() {
    document.getElementById('ctrl-plus').classList.remove('hidden');

    document.getElementById('ctrl-text').classList.add('hidden');
    document.getElementById('ctrl-image').classList.add('hidden');
    document.getElementById('ctrl-cancel').classList.add('hidden');
    document.getElementById('ctrl-title').classList.add('hidden');
    document.getElementById('ctrl-gpx').classList.add('hidden');

    document.getElementById('controls').classList.remove('open');
}

function openTripMenu() {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('trip-menu').classList.remove('hidden');
}

function closeTripMenu() {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('trip-menu').classList.add('hidden');
}

function confirmDeleteTrip() {
    if (confirm("¿Seguro que quieres borrar este viaje?") == true) {
        delete tripsList[currentTripId];
        save();
        goHome();
    }
    closeTripMenu();
}

function initTripControls() {
    document.getElementById('ctrl-plus').addEventListener('click', openControls, false);
    document.getElementById('ctrl-cancel').addEventListener('click', closeControls, false);
    document.getElementById('ctrl-text').addEventListener('click', openEditText, false);




    document.getElementById('go-home').addEventListener('click', goHome, false);
    document.getElementById('trip-menu-icon').addEventListener('click', openTripMenu, false);
    document.getElementById('overlay').addEventListener('click', closeTripMenu, false);


    document.getElementById('delete-trip').addEventListener('click', confirmDeleteTrip, false);

    document.getElementById('trip-title').addEventListener('click', openEditTrip, false);
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
    tripDate.innerHTML = formatDate(data.date);

    title.appendChild(tripName);
    title.appendChild(tripDate);
    trip.appendChild(title);

    document.getElementById('trips-container').appendChild(trip);
}

function reloadTrips() {
    console.log("reloadTrips")
    var tripsContainer = document.getElementById('trips-container');
    tripsContainer.innerHTML = '';

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
    section.classList.add('draggable');
    img = document.createElement('img');
    img.classList.add('icon');

    if ('text' == data.type){
        img.src = 'icons/font.png';
        text = document.createElement('div');
        text.classList.add('container');
        text.classList.add('text-container');
        text.innerText = data.text;

        text.dataset.sectionId = data.id;
        text.addEventListener('click', openEditTextEv, false);

        section.appendChild(img);
        section.appendChild(text);
    }
    document.getElementById('sections-container').appendChild(section);
}

function reloadSections(sections) {
    var sectionsContainer = document.getElementById('sections-container');
    sectionsContainer.innerHTML = '';

    Object.values(sections).forEach(reloadSection);

    initSectionsSortable(sectionsContainer);
}

function openViewTrip(tripId) {
    closeControls();
    currentSectionId = null;

    var trip = tripsList[tripId];
    currentTripId = tripId;

    document.getElementById('detail-trip-name').innerHTML = trip.name;
    document.getElementById('detail-trip-date').innerHTML = formatDate(trip.date);
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
        document.getElementById('trip-id').value = trip.id;
        document.getElementById('trip-theme').value = trip.theme;
    }

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.remove('hidden');
    document.getElementById('section-icon').src = 'icons/trotamundos.png';

    document.getElementById('section-text').classList.add('hidden');
    document.getElementById('section-trip-data').classList.remove('hidden');
}

function saveSection() {
    if ("trip" == currentSection){
        saveTrip();
    } else if ("text" == currentSection){
        saveText();
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
            section = {id: uuidv4(), type: "text"};
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


function openEditTextEv(ev) {
    currentSectionId = ev.currentTarget.dataset.sectionId;
    openEditText();
}

function openEditText() {
    currentSection = "text";
    var trip = tripsList[currentTripId];
    console.log(currentSectionId);
    console.log(trip);
    if (currentSectionId == null) {
        document.getElementById('trip-text').value = '';
    } else {
        document.getElementById('trip-text').value = trip.sections[currentSectionId].text;
    }

    document.getElementById('section-title').innerHTML = trip.name;
    document.getElementById('section-icon').src = 'icons/font.png';


    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.remove('hidden');


    document.getElementById('section-text').classList.remove('hidden');
    document.getElementById('section-trip-data').classList.add('hidden');
}


function initHomeControls() {
    document.getElementById('add-trip').addEventListener('click', openEditTrip, false);
}

function initSectionControls() {
    document.getElementById('section-save').addEventListener('click', saveSection, false);
    document.getElementById('section-cancel').addEventListener('click', goBack, false);
}

window.onload = function (e) {
    initServiceWorker();

    initHomeControls();
    initTripControls();
    initSectionControls();

    goHome();
}