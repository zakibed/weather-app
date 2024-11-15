export default class Display {
    static #updateCurrentWeather({ name, country }, current) {
        document.querySelector('.current-weather-card').innerHTML = `
            <section class="main-info">
                <header>
                    <h1 class="location">
                        <i class="fa-solid fa-location-dot"></i>
                        <span class="name">${name}</span>,
                        <span class="country">${country}</span>
                    </h1>
                    <p class="date-time">
                        <i class="fa-regular fa-calendar"></i>
                        <span class="date" data-key="date">${current.date}</span>
                        <i class="fa-regular fa-clock"></i>
                        <span class="time" data-key="time">${current.time}</span>
                    </p>
                </header>

                <section class="current-condition">
                    <i class="wi ${current.condition.icon} wi-fw"></i>
                    <p class="temp temp-celsius">
                        <span class="temp-value">${current.temp_c}</span>
                        <sup class="temp-unit">°C</sup>
                    </p>
                    <p class="temp temp-fahrenheit">
                        <span class="temp-value">${current.temp_f}</span>
                        <sup class="temp-unit">°F</sup>
                    </p>
                    <p class="condition-text">${current.condition.text}</p>
                </section>
            </section>

            <hr />

            <section class="weather-details">
                <h2>Details</h2>

                <div class="weather-detail">
                    <i class="wi wi-thermometer"></i>
                    <h3>Feels Like</h3>
                    <p class="weather-detail-value temp temp-celsius">
                        <span class="temp-value">${current.feelslike_c}</span>
                        <sup class="temp-unit">°C</sup>
                    </p>
                    <p class="weather-detail-value temp temp-fahrenheit">
                        <span class="temp-value">${current.feelslike_f}</span>
                        <sup class="temp-unit">°F</sup>
                    </p>
                </div>

                <div class="weather-detail">
                    <i class="wi wi-rain"></i>
                    <h3>Chance of Rain</h3>
                    <p class="weather-detail-value">${current.rain_chance}%</p>
                </div>

                <div class="weather-detail">
                    <i class="wi wi-day-sunny"></i>
                    <h3>UV Index</h3>
                    <p class="weather-detail-value">${current.uv_index}</p>
                </div>

                <div class="weather-detail">
                    <i class="wi wi-strong-wind"></i>
                    <h3>Wind Speed</h3>
                    <p class="weather-detail-value wind-kph">${current.wind_kph} km/h</p>
                    <p class="weather-detail-value wind-mph">${current.wind_mph} mph</p>
                </div>
            </section>
        `;

        document.querySelector('.additional-details-card').innerHTML = `
            <h2>Additional Details</h2>

            <div class="weather-detail">
                <i class="wi wi-humidity"></i>
                <h3>Humidity</h3>
                <p class="weather-detail-value">${current.humidity}%</p>
            </div>

            <div class="weather-detail">
                <i class="wi wi-barometer"></i>
                <h3>Pressure</h3>
                <p class="weather-detail-value pressure-hpa">${current.pressure_hpa} hPa</p>
                <p class="weather-detail-value pressure-in">${current.pressure_in} in</p>
            </div>

            <div class="weather-detail">
                <i class="wi wi-windy"></i>
                <h3>Air Quality</h3>
                <p class="weather-detail-value">${current.aqi}</p>
            </div>

            <div class="weather-detail">
                <i class="wi wi-horizon-alt"></i>
                <h3>Sunrise / Sunset</h3>
                <p class="weather-detail-value sunrise-sunset">
                    <span class="sunrise">${current.sunrise.replace(/^0+/, '')}</span> /
                    <span class="sunset">${current.sunset.replace(/^0+/, '')}</span>
                </p>
            </div>
        `;
    }

    static #updateDayForecast(forecast) {
        let html = '';

        forecast.forEach((hour) => {
            html += `
                <div class="forecast-hour">
                    <p class="hour">${hour.time}</p>
                    <i class="wi ${hour.condition_icon} wi-fw"></i>
                    <p class="temp temp-celsius">
                        <span class="temp-value">${hour.temp_c}</span>
                        <sup class="temp-unit">°C</sup>
                    </p>
                    <p class="temp temp-fahrenheit">
                        <span class="temp-value">${hour.temp_f}</span>
                        <sup class="temp-unit">°F</sup>
                    </p>
                </div>
            `;
        });

        document.querySelector('.forecast-hours').innerHTML = html;
    }

    static #updateWeekForecast(forecast) {
        let html = '';

        forecast.forEach((day) => {
            html += `
                <div class="forecast-day">
                    <h3 class="day-of-week">${day.day}</h3>

                    <div class="condition">
                        <i class="wi ${day.condition.icon}"></i>
                        <p class="condition-text">${day.condition.text}</p>
                    </div>

                    <div class="temp-range">
                        <p class="temp temp-celsius temp-max">
                            <span class="temp-value">${day.temp_max_c}</span>
                            <sup class="temp-unit">°C</sup>
                        </p>
                        <p class="temp temp-fahrenheit temp-max">
                            <span class="temp-value">${day.temp_max_f}</span>
                            <sup class="temp-unit">°F</sup>
                        </p>
                        <p class="temp temp-celsius temp-min">
                            <span class="temp-value">${day.temp_min_c}</span>
                            <sup class="temp-unit">°C</sup>
                        </p>
                        <p class="temp temp-fahrenheit temp-min">
                            <span class="temp-value">${day.temp_min_f}</span>
                            <sup class="temp-unit">°F</sup>
                        </p>
                    </div>
                </div>  
            `;
        });

        document.querySelector('.forecast-days').innerHTML = html;
    }

    static showSearchResults(data) {
        const input = document.querySelector('.search-bar input');
        const card = document.querySelector('.search-results-card');
        const container = document.querySelector('.search-results');

        if (data === null) {
            input.dataset.name = '';
            input.dataset.lat = '';
            input.dataset.lon = '';

            if (input.value.length < 1) {
                card.classList.add('hidden');
            } else {
                card.classList.remove('hidden');
                container.innerHTML = `<p class="search-result error">No location found.</p>`;
            }

            return;
        }

        let html = '';

        data.forEach(({ name, region, country, lat, lon }, index) => {
            if (index === 0) {
                input.dataset.name = `${name}, ${region}, ${country}`;
                input.dataset.lat = lat;
                input.dataset.lon = lon;
            }

            html += `
                <p
                    class="search-result"
                    data-name="${name}, ${region}, ${country}"
                    data-lat="${lat}" data-lon="${lon}"
                >
                    <i class="fa-solid fa-location-dot"></i>
                    <span class="name">${name}</span>,
                    <span class="country">${country}</span>
                </p>
            `;
        });

        card.classList.remove('hidden');
        container.innerHTML = html;
    }

    static getSearchResult(element) {
        const input = document.querySelector('.search-bar input');

        Object.keys(element.dataset).forEach((key) => {
            input.dataset[key] = element.dataset[key];
        });
        input.value = element.dataset.name;
    }

    static updateSettings(settings) {
        const classList = [];

        Object.values(settings).forEach((value) => {
            document.querySelector(`input[value='${value}']`).checked = true;
            classList.push(`unit-${value}`);
        });

        document.documentElement.className = classList.join(' ');
    }

    static toggleLoader(bool) {
        document.querySelector('.loader').classList.toggle('hidden', !bool);
    }

    static toggleDropdown(bool) {
        document.querySelector('.dropdown').classList.toggle('hidden', !bool);
        document.querySelector('.overlay').classList.toggle('hidden', !bool);
    }

    static updateWeather(data) {
        document.querySelector('.search-bar input').value = '';
        document.querySelector('.search-results-card').classList.add('hidden');

        this.#updateCurrentWeather(data.location, data.current);
        this.#updateDayForecast(data.day_forecast);
        this.#updateWeekForecast(data.week_forecast);
    }
}
