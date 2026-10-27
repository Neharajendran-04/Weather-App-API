function showSearchStatus(message, isError = false) {
  const status = document.getElementById("search-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}


function getWindDirection(deg) {
  if (typeof deg !== "number" || !Number.isFinite(deg)) {
    return "Unknown";
  }
  const directions = [
    "North",
    "Northeast",
    "East",
    "Southeast",
    "South",
    "Southwest",
    "West",
    "Northwest"
  ];
  return directions[Math.round(deg / 45) % 8];
}


function updateSunPosition(sunrise, sunset, now) {
  const sunDot = document.getElementById("sun-dot");

  if (now < sunrise || now >= sunset) {
    sunDot.style.display = "none";
    return;
  }

  sunDot.style.display = "block";

  const progress = Math.max(
    0,
    Math.min(1, (now - sunrise) / (sunset - sunrise))
  );

  const sunX = 30 + progress * 340;
  const sunY = 110 - 280 * progress * (1 - progress);

  sunDot.setAttribute("cx", sunX);
  sunDot.setAttribute("cy", sunY);
}

const weatherBackgrounds = {
  Clear: "clear-sky",
  "few clouds": "few-clouds-sky",
  "scattered clouds": "few-clouds-sky",
  "broken clouds": "broken-clouds-sky",
  Clouds: "cloudy-sky",
  Rain: "rainy-sky",
  Drizzle: "rainy-sky",
  Thunderstorm: "stormy-sky",
  Snow: "snowy-sky",
  Mist: "foggy-sky",
  Smoke: "foggy-sky",
  Haze: "foggy-sky",
  Dust: "foggy-sky",
  Fog: "foggy-sky",
  Sand: "foggy-sky",
  Ash: "foggy-sky"
};

const nightBackgrounds = {
  Clear: "night-sky",
  "few clouds": "night-overcast",
  "scattered clouds": "night-overcast",
  "broken clouds": "night-overcast",
  "overcast clouds": "night-overcast",
  Clouds: "night-overcast",
  Rain: "rainy-night",
  Drizzle: "rainy-night",
  Mist: "foggy-night",
  Fog: "foggy-night",
  Haze: "foggy-night",
  Smoke: "foggy-night",
  Dust: "foggy-night",
  Sand: "foggy-night",
  Ash: "foggy-night",
  Snow: "snowy-night",
  Thunderstorm: "stormy-night"
};


const weatherHero = document.querySelector(".weather-hero");

function getTimeOfDay(weatherData) {
  const now = weatherData.dt;
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;

  if (now < sunrise || now >= sunset) {
    return "night";
  }

  if (now >= sunset - 3600) {
    return "sunset";
  }

  if (now < sunrise + 3600) {
    return "morning";
  }

  return "day";
}
async function fetchApi(city = "kakkanad") {
  showSearchStatus("Loading weather...");
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=8ac5c4d57ba6a4b3dfcf622700447b1e&units=metric`);
    console.log(response);
    if (!response.ok) {
      showSearchStatus("City not found. Please try another city.", true);
      return;
    }
    
    const weatherData = await response.json()
    console.log(weatherData);

    const condition = weatherData.weather[0].main;
    const description = weatherData.weather[0].description;
    const timeOfDay = getTimeOfDay(weatherData);

    weatherHero.className = "weather-hero";
    let background;
    if (timeOfDay === "night") {
      background =
        nightBackgrounds[condition] ||
        "night-sky";

    } else {
      background =
        weatherBackgrounds[description] ||
        weatherBackgrounds[condition] ||
        "cloudy-sky";
    }

    weatherHero.classList.add(background);


    const weathername = weatherData.name;
    const weathertemp = weatherData.main.temp;
    const weatherdescription = weatherData.weather[0].description;
    const feelslike = weatherData.main.feels_like;
    const weatherhumidity = weatherData.main.humidity;
    const windspeed = weatherData.wind.speed;
    const winddirection = weatherData.wind.deg;
    const visibility = weatherData.visibility;
    const cloudcover = weatherData.clouds.all;
    const pressure = weatherData.main.pressure;
    const sunrise = weatherData.sys.sunrise;
    const sunriseTime = new Date(
      (sunrise + weatherData.timezone) * 1000
    ).toISOString().slice(11, 16);
    const sunset = weatherData.sys.sunset;

    const sunsetTime = new Date(
      (sunset + weatherData.timezone) * 1000
    ).toISOString().slice(11, 16);
    const dayLength = sunset - sunrise;
    const hours = Math.floor(dayLength / 3600);
    const minutes = Math.floor((dayLength % 3600) / 60);
    updateSunPosition(sunrise, sunset, weatherData.dt);

    const rainfall = weatherData.rain?.["1h"] ?? 0;
    const windgust = weatherData.wind.gust ?? 0;

    document.getElementById("city-name").textContent =
      `${weathername}, ${weatherData.sys.country}`;

    document.getElementById("temperature").innerHTML =
      `${weathertemp.toFixed(1)}<span>°</span>`;

    document.getElementById("weather-description").textContent =
      weatherdescription;

    document.getElementById("feels-like").textContent =
      `Feels like ${feelslike.toFixed(1)}°C`;

    document.getElementById("cloud-cover").textContent =
      `Cloud cover ${cloudcover}%`;

    document.getElementById("humidity").innerHTML =
      `${weatherhumidity}<span>%</span>`;

    document.getElementById("pressure").textContent =
      `${pressure} hPa`;

    document.getElementById("windspeed").innerHTML =
      `${(windspeed * 3.6).toFixed(1)} <span>km/h</span>`;

    document.getElementById("visibility").innerHTML =
      `${(visibility / 1000).toFixed(1)} <span>km</span>`;

    document.getElementById("winddirection").textContent =
      `From ${getWindDirection(winddirection)}`;

    document.getElementById("cloudcard").innerHTML =
      `${cloudcover}<span>%</span>`;

    document.getElementById("cloudnote").textContent =
      cloudcover >= 90 ? "Fully overcast" :
        cloudcover >= 60 ? "Mostly cloudy" :
          cloudcover >= 30 ? "Partly cloudy" :
            cloudcover >= 1 ? "Mostly clear" : "Clear skies";

    document.getElementById("rainfall").textContent =
      `${rainfall} mm`;

    document.getElementById("windgust").textContent =
      `${(windgust * 3.6).toFixed(1)} km/h`;



    document.getElementById("sunrise-time").textContent = sunriseTime;
    document.getElementById("sunset-time").textContent = sunsetTime;
    document.getElementById("day-length").textContent =
      `${hours}h ${minutes}m`;
    showSearchStatus("");


  } catch (error) {
    console.error("Weather fetch failed:", error);
    showSearchStatus("Unable to fetch weather. Please check your connection.", true);
  }



}

fetchApi();

const searchForm = document.getElementById("city-search");
const cityInput = document.getElementById("city-input");
cityInput.addEventListener("input", () => {
  showSearchStatus("");
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showSearchStatus("Please enter a city name.", true);
    return;
  }

  if (city) {
    fetchApi(city);
  }
});

