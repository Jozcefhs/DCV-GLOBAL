const forms = document.forms;
//search form event
const searchInput = document.querySelector('input#search');
forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = searchInput.value;
    if (searchValue) window.location.href = `https://www.google.com/search?q=${searchValue}`;
});