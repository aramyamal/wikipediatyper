async function searchWikipedia() {
    const input = document.getElementById('searchInput');
    const languageSelect = document.getElementById('languageSelect');
    const resultsDiv = document.getElementById('searchResults');
    const wasVisible = resultsDiv.classList.contains('show');

    if (input.value.length < 3) {
        resultsDiv.classList.remove('show');
        resultsDiv.innerHTML = '';
        return;
    }

    const lang = languageSelect.dataset.selectedLang || 'en';

    try {
        const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${input.value}`);
        const data = await response.json();

        // only animate if results weren't already visible
        if (!wasVisible) {
            resultsDiv.style.opacity = '0';
            resultsDiv.style.transform = 'scale(0.95)';
            resultsDiv.classList.add('show');
            void resultsDiv.offsetHeight; // trigger reflow
            resultsDiv.style.opacity = '1';
            resultsDiv.style.transform = 'scale(1)';
        }

        resultsDiv.innerHTML = data.query.search.slice(0, 5).map(result => `
            <a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(result.title)}" 
               target="_blank" 
               class="dropdown-item w-100 py-3">
                <h6 class="mb-1 dropdown-header text-wrap">${result.title}</h6>
                <p class="mb-1 text-wrap">${result.snippet}...</p>
            </a>
        `).join('');

        // update visibility without animation if already shown
        if (data.query.search.length > 0 && wasVisible) {
            resultsDiv.classList.add('show');
        }

    } catch (error) {
        console.error('Error:', error);
        resultsDiv.classList.remove('show');
        resultsDiv.innerHTML = '';
    }
}

document.querySelectorAll('#languageSelect + .dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const value = e.target.dataset.value;
        const languageSelect = document.getElementById('languageSelect');
        const searchInput = document.getElementById('searchInput');

        // update language display and storage
        languageSelect.textContent = e.target.textContent;
        languageSelect.dataset.selectedLang = value;

        // close language dropdown
        const languageDropdown = document.querySelector('#languageSelect + .dropdown-menu');
        languageDropdown.classList.remove('show');

        // trigger new search if there's existing input
        if (searchInput.value.length >= 3) {
            searchWikipedia();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // set initial language
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.dataset.selectedLang = 'en'; // set default to English
});

// close search results when clicking outside
document.addEventListener('click', function(event) {
    const searchResults = document.getElementById('searchResults');

    if (shouldCloseResults(event)) {
        // trigger closing animation
        searchResults.classList.add('closing');

        // wait for animation to finish before hiding
        searchResults.addEventListener('transitionend', function handler() {
            searchResults.classList.remove('show', 'closing');
            searchResults.removeEventListener('transitionend', handler);
        }, { once: true });
    }
});

function shouldCloseResults(event) {
    return !event.target.closest('#searchInput') &&
        !event.target.closest('#searchResults') &&
        !event.target.closest('#languageSelect') &&
        !event.target.closest('#languageSelect + .dropdown-menu');
}

// reshow search results when search bar is in focus again
document.getElementById('searchInput').addEventListener('focus', function() {
    if (this.value.length >= 3) {
        searchWikipedia();
    }
});
