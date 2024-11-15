import API from './API';
import Display from './Display';

export default class App {
    #location;
    #settings;

    async #updateWeather() {
        Display.toggleLoader(true);

        const data = await API.fetchWeather(this.#location);

        if (data === null) return;

        Display.updateWeather(data);
        Display.toggleLoader(false);
    }

    async init() {
        this.#location = await API.getUserLocation();
        this.#settings = API.getUserSettings();

        this.#updateWeather();
        Display.updateSettings(this.#settings);

        const searchForm = document.querySelector('.search-bar');
        const searchInput = document.querySelector('.search-bar input');
        const searchResults = document.querySelector('.search-results');
        const settingsBtn = document.querySelector('.btn-open-settings');
        const settingsDropdown = document.querySelector('.settings .dropdown');
        const overlay = document.querySelector('.overlay');

        searchInput.addEventListener('input', async () => {
            const data = await API.fetchSearchResults(searchInput.value);

            Display.showSearchResults(data);
        });

        searchResults.addEventListener('click', ({ target }) => {
            if (!target.matches('.search-result')) return;

            Display.getSearchResult(target);
        });

        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (searchInput.dataset.name === '') return;

            this.#location = { ...searchInput.dataset };

            localStorage.setItem('location', JSON.stringify(this.#location));
            this.#updateWeather();
        });

        settingsBtn.addEventListener('click', () => {
            Display.toggleDropdown(true);
        });

        overlay.addEventListener('click', () => {
            Display.toggleDropdown(false);
        });

        settingsDropdown.addEventListener('change', () => {
            document
                .querySelectorAll('.settings input:checked')
                .forEach((input) => {
                    this.#settings[`${input.name}Unit`] = input.value;
                });
            localStorage.setItem('settings', JSON.stringify(this.#settings));
            Display.updateSettings(this.#settings);
        });
    }
}
