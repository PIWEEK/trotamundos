function initSortable() {

    var listContainer = document.getElementById('list-container');
    Sortable.create(listContainer, {
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
        .register("/service-worker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err));

}



window.onload = function (e) {
    initServiceWorker();
    initSortable();
    initControls();
}