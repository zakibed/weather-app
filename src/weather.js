import { format } from 'date-fns';
import {
    WEATHERAPI_KEY,
    WEATHER_MAPPINGS,
    AIR_QUALITY_INDEX,
    DEFAULT_LOCATIONS
} from './constants.js';

function getWeatherCondition(code) {
    return WEATHER_MAPPINGS.find((condition) => condition.codes.includes(code));
}

function getCurrentWeather(data) {
    const date = new Date(data.location.localtime);
    const timeOfDay = data.current.is_day ? 'day' : 'night';
    const condition = getWeatherCondition(data.current.condition.code);

    return {
        date: format(date, 'E, MMM d, yyyy'),
        time: format(date, 'h:mm a'),
        sunrise: data.forecast.forecastday[0].astro.sunrise,
        sunset: data.forecast.forecastday[0].astro.sunset,
        condition: {
            text: condition.text[timeOfDay],
            icon: condition.icon[timeOfDay]
        },
        temp_c: Math.round(data.current.temp_c),
        temp_f: Math.round(data.current.temp_f),
        feelslike_c: Math.round(data.current.feelslike_c),
        feelslike_f: Math.round(data.current.feelslike_f),
        rain_chance:
            data.forecast.forecastday[0].hour[+format(date, 'H')]
                .chance_of_rain,
        uv_index: data.current.uv,
        aqi: AIR_QUALITY_INDEX[data.current.air_quality['us-epa-index'] - 1],
        wind_kph: Math.round(data.current.wind_kph),
        wind_mph: Math.round(data.current.wind_mph),
        pressure_hpa: data.current.pressure_mb,
        pressure_in: data.current.pressure_in,
        humidity: data.current.humidity
    };
}

function getDayForecast(data) {
    const currentHour = +format(new Date(data[0].location.localtime), 'H');
    const forecast = [];

    for (let i = currentHour + 1; i <= currentHour + 24; i++) {
        const timeOfDay = data[1].hourly.is_day[i] ? 'day' : 'night';
        const condition = getWeatherCondition(data[1].hourly.weather_code[i]);

        forecast.push({
            time: format(new Date(data[1].hourly.time[i]), 'h:mm a'),
            condition_icon: condition.icon[timeOfDay],
            temp_c: Math.round(data[1].hourly.temperature_2m[i]),
            temp_f: Math.round(data[2].hourly.temperature_2m[i])
        });
    }

    return forecast;
}

function getWeekForecast(data) {
    const forecast = [];

    for (let i = 1; i <= 7; i++) {
        const condition = getWeatherCondition(data[1].daily.weather_code[i]);

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

export async function getUserLocation() {
    const store = localStorage.getItem('location');

    if (store !== null) return JSON.parse(store);

    try {
        const { coords } = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        return { lat: coords.latitude, lon: coords.longitude };
    } catch {
        return DEFAULT_LOCATIONS[
            Math.floor(Math.random() * DEFAULT_LOCATIONS.length)
        ];
    }
}

export function getUserSettings() {
    const store = localStorage.getItem('settings');

    if (store !== null) return JSON.parse(store);

    return {
        tempUnit: 'celsius',
        windUnit: 'kph',
        pressureUnit: 'hpa'
    };
}

export async function fetchSearchResults(value) {
    try {
        if (value === '') throw new Error('Empty search query.');

        const res = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${WEATHERAPI_KEY}&q=${value}`
        );

        if (!res.ok) throw new Error('Could not fetch search results.');

        const data = await res.json();

        if (data.length === 0) throw new Error('No location found.');

        return data;
    } catch (err) {
        return null;
    }
}

export async function fetchWeather({ name, lat, lon }) {
    try {
        const res = await Promise.all([
            // fetch current weather
            fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${name || `${lat},${lon}`}&aqi=yes&days=1`
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
            throw new Error('Could not fetch weather.');
        }

        const data = await Promise.all(res.map((x) => x.json()));

        return {
            location: {
                name: data[0].location.name,
                country: data[0].location.country
            },
            current: getCurrentWeather(data[0]),
            day_forecast: getDayForecast(data),
            week_forecast: getWeekForecast(data)
        };
    } catch (err) {
        return null;
    }
}
