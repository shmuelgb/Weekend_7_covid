//variables
const state = { dataType: "confirmed" };
const continentsList = ["asia", "europe", "africa", "america"];
const countriesMap = {};
const covidPerContinentMap = {};
const covidPerCountryMap = {};
const cors = "https://intense-mesa-62220.herokuapp.com/";

//DOM Elements
const continentsEL = document.querySelectorAll("[data-continent]");
const dataTypeEL = document.querySelectorAll("[data-type]");
const countriesContainerEl = document.querySelectorAll(".countries-container");
const chartContainerEl = document.querySelector(".chart-container");

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

//functions

//event listeners
continentsEL.forEach((continent) => {
  continent.addEventListener("click", (e) => {
    getData(e.target.dataset.continent);
    createChart(e.target.dataset.continent);
    // update current chart
  });
});

dataTypeEL.forEach((dataType) => {
  dataType.addEventListener("click", (e) => {
    state.dataType = e.target.dataset.type;
    createChart(e.target.dataset.continent);
  });
});

//check if data exists. if not, get it from api
function getData(continent) {
  if (countriesMap[continent]) {
    return;
  } else {
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
  createChart(continent);
}

//countries and covid API's are somewhat inconsistent. fix it:
function amendData(continent) {
  countriesMap[continent].forEach((country) => {
    if (covidPerCountryMap[country.name] === undefined) {
      covidPerCountryMap[country.name] = new CovidData(continent, 0, 0, 0, 0);
    }
    if (country.code === "XK") country.code = null;
  });
}

function createChart(continent) {
  if (countriesMap[continent]) {
    const chartEl = document.createElement("canvas");
    chartContainerEl.appendChild(chartEl);
    chartEl.setAttribute("class", "");
    const chart = new Chart(chartEl, {
      type: "line",
      data: {
        labels: countriesMap[continent].map((country) => country.name),
        datasets: [
          {
            label: state.dataType,
            data: getCovidDataPerContinent(continent, state.dataType),
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "bla bla",
        },
        legend: {
          position: "right",
        },
      },
    });
  }
}

function getCovidDataPerContinent(continent, type) {
  const covidData = countriesMap[continent].map((country) => {
    return covidPerCountryMap[country.name][type];
  });
  return covidData;
}
