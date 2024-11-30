let show = document.getElementById("show");
let search = document.getElementById("search");
let geoSearch = document.getElementById("geo-search");
let cityVal = document.getElementById("city");

let key = "2f745fa85d563da5adb87b6cd4b81caf";
let cache = {}; // Cache for storing previous results

let getWeather = () => {
    let cityValue = cityVal.value.trim();
    if (cityValue.length === 0) {
        show.innerHTML = `<h3 class="error">Please enter a city name</h3>`;
        return;
    }

    // Check if the result is cached
    if (cache[cityValue]) {
        displayWeather(cache[cityValue]);
        return;
    }

    // Create and show loading indicator
    let loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading...';
    loadingIndicator.className = 'loading-indicator';
    show.appendChild(loadingIndicator);

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${key}&units=metric`;
    cityVal.value = "";

    fetch(url)
        .then((resp) => {
            if (!resp.ok) throw new Error('City not found');
            return resp.json();
        })
        .then((data) => {
            cache[cityValue] = data; // Cache the result
            displayWeather(data); // Display the weather data
        })
        .catch(() => {
            show.innerHTML = `<h3 class="error">City not found</h3>`;
        })
        .finally(() => {
            if (loadingIndicator.parentNode) {
                show.removeChild(loadingIndicator); // Remove loading indicator
            }
        });
};

let displayWeather = (data) => {
    show.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <h4 class="weather">${data.weather[0].main}</h4>
        <h4 class="desc">${data.weather[0].description}</h4>
        <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
        <h1>${data.main.temp} &#176;</h1>
       <div class="temp_container">
           <div>
               <h4 class="title">Min</h4>
               <h4 class="temp">${data.main.temp_min}&#176;</h4>
           </div>
           <div>
               <h4 class="title">Max</h4>
               <h4 class="temp">${data.main.temp_max}&#176;</h4>
           </div> 
           <div>
               <h4 class="title">Feels Like</h4>
               <h4 class="temp">${data.main.feels_like}&#176;</h4>
           </div> 
           <div>
               <h4 class="title">Visibility</h4>
               <h4 class="temp">${data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A'} km</h4>
           </div> 
       </div>
    `;
};

// Geolocation for current location weather
geoSearch.addEventListener("click", () => {
    if (navigator.geolocation) {
        // Prompt the user for their location
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Fetch weather data for the user's location
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error("Unable to fetch weather");
                        return response.json();
                    })
                    .then(data => {
                        // Display the weather
                        displayWeather(data);
                    })
                    .catch(() => {
                        show.innerHTML = `<h3 class="error">Unable to get location weather</h3>`;
                    });
            },
            error => {
                // Handle errors if user denies location access or other issues
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        show.innerHTML = `<h3 class="error">Permission denied. Please allow location access.</h3>`;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        show.innerHTML = `<h3 class="error">Location information is unavailable.</h3>`;
                        break;
                    case error.TIMEOUT:
                        show.innerHTML = `<h3 class="error">Location request timed out.</h3>`;
                        break;
                    default:
                        show.innerHTML = `<h3 class="error">An unknown error occurred.</h3>`;
                }
            }
        );
    } else {
        // If geolocation is not supported
        show.innerHTML = `<h3 class="error">Geolocation is not supported by this browser.</h3>`;
    }
});

// Event listeners for search button and Enter key
search.addEventListener("click", getWeather);
cityVal.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Focus on input field when the page loads
window.addEventListener("load", () => {
    cityVal.focus();
});
