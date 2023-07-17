var listContainer = document.getElementById('list-container');
Sortable.create(listContainer, {
    animation: 150,
    draggable: '.draggable',
    dragoverBubble: true,
});