import { format } from 'date-fns';
import {
    WEATHERAPI_KEY,
    WEATHER_MAPPINGS,
    AIR_QUALITY_INDEX,
    DEFAULT_LOCATIONS
} from './data/constants';

export default class API {
    static #KEY = WEATHERAPI_KEY;
    static #MAPPINGS = WEATHER_MAPPINGS;
    static #AQI = AIR_QUALITY_INDEX;
    static #LOCATIONS = DEFAULT_LOCATIONS;

    static #getCondition(code) {
        return this.#MAPPINGS.find((x) => x.codes.includes(code));
    }

    static #getCurrentWeather(data) {
        const date = new Date(data[0].location.localtime);
        const timeOfDay = data[0].current.is_day ? 'day' : 'night';
        const condition = this.#getCondition(data[0].current.condition.code);

        return {
            date: format(date, 'E, MMM d, yyyy'),
            time: format(date, 'h:mm a'),
            sunrise: data[0].forecast.forecastday[0].astro.sunrise,
            sunset: data[0].forecast.forecastday[0].astro.sunset,
            condition: {
                text: condition.text[timeOfDay],
                icon: condition.icon[timeOfDay]
            },
            temp_c: Math.round(data[0].current.temp_c),
            temp_f: Math.round(data[0].current.temp_f),
            feelslike_c: Math.round(data[0].current.feelslike_c),
            feelslike_f: Math.round(data[0].current.feelslike_f),
            rain_chance:
                data[0].forecast.forecastday[0].hour[+format(date, 'H')]
                    .chance_of_rain,
            uv_index: data[0].current.uv,
            aqi: this.#AQI[data[0].current.air_quality['us-epa-index'] - 1],
            wind_kph: Math.round(data[0].current.wind_kph),
            wind_mph: Math.round(data[0].current.wind_mph),
            pressure_hpa: data[0].current.pressure_mb,
            pressure_in: data[0].current.pressure_in,
            humidity: data[0].current.humidity
        };
    }

    static #getDayForecast(data) {
        const currentHour = +format(new Date(data[0].location.localtime), 'H');
        const forecast = [];

        for (let i = currentHour + 1; i <= currentHour + 24; i++) {
            const timeOfDay = data[1].hourly.is_day[i] ? 'day' : 'night';
            const condition = this.#getCondition(
                data[1].hourly.weather_code[i]
            );

            forecast.push({
                time: format(new Date(data[1].hourly.time[i]), 'h:mm a'),
                condition_icon: condition.icon[timeOfDay],
                temp_c: Math.round(data[1].hourly.temperature_2m[i]),
                temp_f: Math.round(data[2].hourly.temperature_2m[i])
            });
        }

        return forecast;
    }

    static #getWeekForecast(data) {
        const forecast = [];

        for (let i = 1; i <= 7; i++) {
            const condition = this.#getCondition(data[1].daily.weather_code[i]);

            forecast.push({
                day: format(new Date(data[1].daily.time[i]), 'EEEE'),
                condition: {
                    text: condition.text.night,
                    icon: condition.icon.day
                },
                temp_min_c: Math.round(data[1].daily.temperature_2m_min[i]),
                temp_min_f: Math.round(data[2].daily.temperature_2m_min[i]),
                temp_max_c: Math.round(data[1].daily.temperature_2m_max[i]),
                temp_max_f: Math.round(data[2].daily.temperature_2m_max[i])
            });
        }

        return forecast;
    }

    static async getUserLocation() {
        const store = localStorage.getItem('location');

        if (store !== null) return JSON.parse(store);

        try {
            const { coords } = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            return { lat: coords.latitude, lon: coords.longitude };
        } catch {
            return this.#LOCATIONS[
                Math.floor(Math.random() * this.#LOCATIONS.length)
            ];
        }
    }

    static getUserSettings() {
        const store = localStorage.getItem('settings');

        return store !== null
            ? JSON.parse(store)
            : {
                  tempUnit: 'celsius',
                  windUnit: 'kph',
                  pressureUnit: 'hpa'
              };
    }

    static async fetchSearchResults(value) {
        try {
            if (value === '') throw new Error('Empty search query.');

            const res = await fetch(
                `https://api.weatherapi.com/v1/search.json?key=${this.#KEY}&q=${value}`
            );

            if (!res.ok) throw new Error('Could not fetch resources.');

            const data = await res.json();

            if (data.length === 0) throw new Error('No location found.');

            return data;
        } catch (err) {
            return null;
        }
    }

    static async fetchWeather({ name, lat, lon }) {
        try {
            const res = await Promise.all([
                // fetch current weather
                fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${this.#KEY}&q=${name || `${lat},${lon}`}&aqi=yes&days=1`
                ),
                // fetch weather forecast for next 7 days
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=8`
                ),
                // fetch forecast temperature in fahrenheit
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=8`
                )
            ]);

            if (res.some((x) => !x.ok)) {
                throw new Error('Could not fetch resources.');
            }

            const data = await Promise.all(res.map((x) => x.json()));

            return {
                location: {
                    name: data[0].location.name,
                    country: data[0].location.country
                },
                current: this.#getCurrentWeather(data),
                day_forecast: this.#getDayForecast(data),
                week_forecast: this.#getWeekForecast(data)
            };
        } catch (err) {
            return null;
        }
    }
}
