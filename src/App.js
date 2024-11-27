import {
    fetchWeather,
    fetchSearchResults,
    getUserSettings,
    getUserLocation
} from './weather.js';
import {
    updateDisplay,
    updateSettings,
    toggleLoader,
    toggleDropdown,
    selectSearchResult,
    showSearchResults
} from './display.js';

async function updateWeather(location) {
    toggleLoader(true);

    const data = await fetchWeather(location);

    if (data === null) return;

    updateDisplay(data);
    toggleLoader(false);
}

export default async function init() {
    const searchForm = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-bar input');
    const searchResults = document.querySelector('.search-results');
    const settingsBtn = document.querySelector('.btn-open-settings');
    const settingsDropdown = document.querySelector('.settings .dropdown');
    const overlay = document.querySelector('.overlay');

    searchInput.addEventListener('input', async () => {
        const data = await fetchSearchResults(searchInput.value);

        showSearchResults(data);
    });

    searchResults.addEventListener('click', ({ target }) => {
        if (!target.matches('.search-result')) return;

        selectSearchResult(target);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (searchInput.dataset.name === '') return;

        const newLocation = { ...searchInput.dataset };

        localStorage.setItem('location', JSON.stringify(newLocation));
        updateWeather(newLocation);
    });

    settingsBtn.addEventListener('click', () => {
        toggleDropdown(true);
    });

    overlay.addEventListener('click', () => {
        toggleDropdown(false);
    });

    settingsDropdown.addEventListener('change', () => {
        const newSettings = {};

        document
            .querySelectorAll('.settings input:checked')
            .forEach((input) => {
                newSettings[`${input.name}Unit`] = input.value;
            });
        localStorage.setItem('settings', JSON.stringify(newSettings));
        updateSettings(newSettings);
    });

    updateWeather(await getUserLocation());
    updateSettings(getUserSettings());
}
