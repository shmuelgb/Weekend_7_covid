# covid-api-statistics

This site shows the latest covid-19 statistics.

## Pseudo Code

-   ### HTML/CSS

```
<body>
    <div class="chart-container"></div>
    <div class="stats-container"></div>
    <div class="continents-container"></div>
    <div class="countries-container"></div>
</body>
```

    -   chart-container - contains the chart that will be dynamically updated
    -   stats-container - contains the 4 types of data(confirmed, deaths, recovered, critical) that will be dynamically updated
    -   continents-container - contains the continent buttons
    -   countries-container - contains the country (links?) that will be dynamically updated

-   ### JavaScript

```
continentsList = []; //list of strings with the names of the continents
countriesMap = {}; //map where key is continent name and value is list of strings with the names of the countries
covidPerContinentMap = {}; //map where key is continent name and value is CovidData object
covidPerCountryMap = {}; //map where key is country name and value is CovidData object

class CovidData {
    constructor(continent, confirmed, deaths, recovered, critical) {
        this.continent = continent;
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
    }
}
```

#### Functions

```
function initializeVariables()
```

-   This function is called when the page is loaded.

    -   It creates the map and the continents list already stored in the local storage - it loads it from there.
    -   Otherwise it calls the Countries REST API to get the list of countries as follows:
        -   First call the Countries REST API to get the list of countries per continent and store in countriesMap([See Notes](#NOTES)).
        -   Then call the Covid REST API to get the CovidData per country and store in covidPerContinentMap([See Notes](#NOTES)).

```
function renderPage()
```

-   This function after the page is loaded, and initializeVariables finished.
    -   it dynamically fills the continents container with buttons, one for each continent.
    -   it adds the click event to each button, so when the user clicks on a button, the map is updated to show the countries and the data of the selected continent.
    -   it dynamically fills the stats container with the data of the selected continent.
    -   it dynamically fills the countries container with links, one for each country.
    -   it dynamically updates the chart with the data of the selected continent.

```
function renderChart(covidData)
```

-   This function is called when the user clicks on a continent button.
    -   it gets the CovidData object of the selected continent and calls the renderChart function.
    -   it uses the chart.js library to create a chart with the data of the selected continent([See Notes](#NOTES)).

---

## Notes <a name="NOTES"></a>

-   COUNTRIES API

    This API gets us the countries by region. Need to substitute the continent name instead of "region_name"

        https://restcountries.herokuapp.com/api/v1/region/:region_name

    for example this API below gets us all countries in Asia

        https://restcountries.herokuapp.com/api/v1/region/asia

-   COVID API

        https://corona-api.com/

    -   Get all countries: https://corona-api.com/countries

    -   Country by Code: http://corona-api.com/countries/:code

-   Chart.js

    -   Installation of chart.js

        ```
        npm i -g
        npm i chart.js
        ```

        Add the following code to the index.html file:

            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    -   Chart.js Documentation

        https://www.chartjs.org/docs/latest/

    -   Chart.js Examples

        -   https://www.chartjs.org/docs/latest/getting-started/usage.html

        -   ```
            <canvas id="myChart" width="400" height="400"></canvas>
            <script>
                const ctx = document.getElementById('myChart').getContext('2d');
                const myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            </script>
            ```
