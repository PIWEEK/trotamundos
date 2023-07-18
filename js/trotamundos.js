////////////////////
var tripsList = [];

if (localStorage.tripsList) {
   tripsList = JSON.parse(localStorage.tripsList);
}

var lastScreen = {
    screen: 'home'
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

function initTripsSortable(tripsContainer) {
    Sortable.create(tripsContainer, {
        animation: 150,
        draggable: '.draggable',
        handle: '.icon',
        dragoverBubble: true,
    });

}

function initSectionsSortable() {
    var sections = document.getElementById('sections-container');
    Sortable.create(sections, {
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

function initControls() {
    document.getElementById('ctrl-plus').addEventListener('click', openControls, false);
    document.getElementById('ctrl-cancel').addEventListener('click', closeControls, false);
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
    trip.dataset.id = data.id;

    image = document.createElement('img');
    image.classList.add('icon');
    image.src = 'icons/trotamundos.png'
    trip.appendChild(image);

    title = document.createElement('div');
    title.classList.add('container');
    title.classList.add('text-container');

    tripName =  document.createElement('div');
    tripName.classList.add('text-title');
    tripName.innerHTML = data.name;

    tripDate =  document.createElement('div');
    tripDate.classList.add('date-title');
    tripDate.innerHTML = data.date;

    title.appendChild(tripName);
    title.appendChild(tripDate);
    trip.appendChild(title);

    document.getElementById('trips-container').appendChild(trip);

}

function reloadTrips() {
    var tripsContainer = document.getElementById('trips-container');
    tripsContainer.innerHTML = '';
    tripsList.forEach(reloadTrip);

    initTripsSortable(tripsContainer);
}

function goHome() {
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.add('hidden');
    reloadTrips();
    document.getElementById('home-screen').classList.remove('hidden');
}


function goBack() {
    if ('home' == lastScreen.screen) {
        goHome();
    }
}

function openAddTrip() {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('trip-screen').classList.add('hidden');
    document.getElementById('section-screen').classList.remove('hidden');

    document.getElementById('section-title').innerHTML = 'Nuevo viaje';
    document.getElementById('trip-date').valueAsDate = new Date();
    document.getElementById('trip-id').value = uuidv4();


    lastScreen = {
        screen: 'home'
    }
}

function saveTrip() {
    if (document.getElementById('section-screen').checkValidity()) {
        var trip = {
            id: document.getElementById('trip-id').value,
            name: document.getElementById('trip-name').value,
            date: document.getElementById('trip-date').value,
            sections: []
        };
        tripsList.push(trip);
        save();
        goHome();
    }
}


function initTripControls() {
    document.getElementById('add-trip').addEventListener('click', openAddTrip, false);
}

function initSectionControls() {
    document.getElementById('section-save').addEventListener('click', saveTrip, false);
    document.getElementById('section-cancel').addEventListener('click', goBack, false);

    document.getElementById('section-screen').addEventListener('submit', function (event) {
        event.preventDefault();
    });
}

window.onload = function (e) {
    initServiceWorker();

    initTripControls();
    initControls();
    initSectionControls();

    goHome();


    initSectionsSortable();
}