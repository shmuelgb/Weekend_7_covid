//variables
const state = { continent: null, dataType: "confirmed" };
const continentsList = ["asia", "europe", "africa", "america"];
const countriesMap = {};
const covidPerCountryMap = {};
const cors = "https://intense-mesa-62220.herokuapp.com/";
const colors = { 1: "#6C4A4A", 2: "#C89595", 3: "#DDBEBE", 4: "#EDEDED" };

//DOM Elements
const continentsEL = document.querySelectorAll("[data-continent]");
const dataTypeEL = document.querySelectorAll("[data-type]");
const countriesContainerEl = document.querySelector(".countries-container");
const chartContainerEl = document.querySelector(".chart-container");
const openingAreaEl = document.querySelector(".main__opening");
const spinnerEl = document.querySelector(".loading-spinner");

//classes
function Country(name, code) {
  this.name = name;
  this.code = code;
}

class CovidData {
  constructor(continent, confirmed, deaths, recovered, critical) {
    this.continent = continent;
    this.confirmed = confirmed;
    this.deaths = deaths;
    this.recovered = recovered;
    this.critical = critical;
  }
}

//event listeners
continentsEL.forEach((continent) => {
  continent.addEventListener("click", (e) => {
    if (!checkScreenSize()) return;
    state.continent = e.target.dataset.continent;
    getData(e.target.dataset.continent);
    createChart(e.target.dataset.continent);
  });
});

dataTypeEL.forEach((dataType) => {
  dataType.addEventListener("click", (e) => {
    if (!checkScreenSize()) return;
    state.dataType = e.target.dataset.type;
    createChart(state.continent);
  });
});

//functions
//check if data exists. if not, get it from api
function getData(continent) {
  if (countriesMap[continent]) {
    return;
  } else {
    spinnerEl.classList.toggle("display-none");
    getApi(continent);
  }
}

//get data from api, store in variables
async function getApi(continent) {
  const countries = [];
  try {
    const countriesApi = await axios.get(
      `${cors}https://restcountries.herokuapp.com/api/v1/region/${continent}?fields=name;alpha2Code`
    );
    countriesApi.data.forEach((country) => {
      countries.push(new Country(country.name.common, country.cca2));
    });
    countriesMap[continent] = countries;
    getCovidData(countries, continent);
  } catch (error) {
    console.log(error);
  }
}

//get covid data by countries and store in variables
async function getCovidData(countries, continent) {
  try {
    fetchAll(countries, continent);
  } catch (error) {
    console.log(error);
  }
}

//fetch multiple simultaneously
async function fetchAll(countries, continent) {
  amendData(continent);
  const countriesCodes = countries.map((country) => {
    return axios.get(`${cors}https://corona-api.com/countries/${country.code}`);
  });
  let data = await Promise.all(countriesCodes);
  data = data.forEach((country) => {
    const latestData = country.data.data.latest_data;
    covidPerCountryMap[country.data.data.name] = new CovidData(
      continent,
      latestData.confirmed,
      latestData.deaths,
      latestData.recovered,
      latestData.critical
    );
  });
  amendData(continent);
  displayContent(continent);
}

//countries and covid API's are somewhat inconsistent. fix it:
function amendData(continent) {
  for (let i = 0; i < countriesMap[continent].length; i++) {
    if (covidPerCountryMap[countriesMap[continent][i].name] === undefined) {
      covidPerCountryMap[countriesMap[continent][i].name] = new CovidData(
        continent,
        0,
        0,
        0,
        0
      );
    }
    if (countriesMap[continent][i].code === "XK")
      countriesMap[continent].splice(i, 1);
  }
}

function displayContent(continent) {
  if (!spinnerEl.classList.contains("display-none")) {
    spinnerEl.classList.add("display-none");
  }
  if (!openingAreaEl.classList.contains("display-none")) {
    openingAreaEl.classList.add("display-none");
  }
  displayCountries(continent);
  createChart(continent);
}

//create button for each country
function displayCountries(continent) {
  countriesMap[continent].forEach((country) => {
    const countryEl = document.createElement("button");
    countryEl.classList.add("btn", "btn-country");
    countryEl.dataset.country = country.name;
    countryEl.innerText = country.name;
    countriesContainerEl.appendChild(countryEl);
    countryEl.addEventListener("click", (e) => {
      createCountryChart(e.target.dataset.country);
    });
  });
}

//create a line chart
function createChart(continent) {
  if (countriesMap[continent]) {
    const chartEl = document.createElement("canvas");
    chartContainerEl.innerHTML = "";
    chartContainerEl.appendChild(chartEl);
    chartEl.setAttribute(
      "height",
      (window.screen.availHeight / 3.5).toString()
    );
    chartEl.setAttribute("width", (window.screen.availHeight * 0.8).toString());
    Chart.defaults.global.defaultFontColor = colors[1];
    const chart = new Chart(chartEl, {
      type: "line",
      data: {
        labels: countriesMap[continent].map((country) => country.name),
        datasets: [
          {
            label: state.dataType,
            data: getCovidDataPerContinent(continent, state.dataType),
            backgroundColor: "rgba(200, 149, 149, 0.2)",
            borderColor: colors[2],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: `Covid-19 in ${continent}`,
          fontSize: 20,
        },
      },
    });
  }
}

//create a doughnut chart for a country
function createCountryChart(country) {
  const chartEl = document.createElement("canvas");
  chartContainerEl.innerHTML = "";
  chartContainerEl.appendChild(chartEl);
  chartEl.setAttribute("height", (window.screen.availHeight / 4).toString());
  chartEl.setAttribute("width", (window.screen.availHeight * 0.9).toString());
  const chart = new Chart(chartEl, {
    type: "doughnut",
    data: {
      labels: ["confirmed", "deaths", "recovered", "critical"],
      datasets: [
        {
          label: "Covid-19",
          data: [
            covidPerCountryMap[country].confirmed,
            covidPerCountryMap[country].deaths,
            covidPerCountryMap[country].recovered,
            covidPerCountryMap[country].critical,
          ],
          backgroundColor: [colors[1], colors[3], colors[2], colors[4]],
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: `Covid-19 in ${country}`,
        fontSize: 20,
      },
    },
  });
}

//check screen size, if not enough, display a message
function checkScreenSize() {
  if (window.screen.availWidth > 730) {
    return true;
  } else {
    const screenSizeMsgEl = document.createElement("p");
    screenSizeMsgEl.innerText =
      "Sorry, screen size too small. Try tiling your device to landscape mode";
    screenSizeMsgEl.classList.add("screen-size-msg");
    chartContainerEl.innerHTML = "";
    chartContainerEl.appendChild(screenSizeMsgEl);
    return false;
  }
}

//extract data from storage and return it
function getCovidDataPerContinent(continent, type) {
  const covidData = countriesMap[continent].map((country) => {
    return covidPerCountryMap[country.name][type];
  });
  return covidData;
}
