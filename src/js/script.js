import { API_URLS } from "./config.js";
import { RES_PER_PAGE } from "./config.js";
import { getJSON } from "./helpers.js";

// DOM Selectors
const inputEl = document.getElementById("inputEl");
const select = document.getElementById("select");
const btnSearch = document.getElementById("btnSearch");
const dataInfoContainer = document.getElementById("dataInfo");
const countriesContainer = document.querySelector(".countries");
const paginationContainer = document.getElementById("paginationContainer");

// Code State
const search = {
  results: [],
  page: 1,
  resultsPerPage: RES_PER_PAGE,
};

// Event Listeners

// Click - Search Button
btnSearch.addEventListener("click", () => {
  getCountry();
  // lose focus
  btnSearch.blur();
});

// Enter Key Press - Input Element
inputEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getCountry();
    // lose focus
    inputEl.blur();
  }
});

// Typing - Input Element
inputEl.addEventListener("input", () => inputEl.classList.remove("error"));

// Value Change - Select Element
select.addEventListener("change", () => {
  select.classList.remove("error");
  select.blur();
});

// Click - Pagination Buttons
paginationContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn--pagination");

  if (!btn) return;

  const pageNum = +btn.dataset.goto;
  const pageData = perPageData(pageNum);

  renderCountry(pageData);
  renderPagination();

  dataInfoContainer.scrollIntoView({
    behavior: "smooth",
  });
});

// Functions

// loader
const renderLoader = function () {
  const html = `<div class="loader"></div>`;

  countriesContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  dataInfoContainer.innerHTML = html;
};

// results
const showResults = function (number) {
  if (number > 1) {
    const html = `  
    <div class="result">
      We've got <span>${number}</span> result(s):
    </div>`;

    dataInfoContainer.innerHTML = html;
  } else {
    dataInfoContainer.innerHTML = "";
  }
};

// error
const renderError = function (error) {
  const html = `
    <p class="error-msg">${error.message}! Try again!</p>
  `;

  countriesContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  dataInfoContainer.innerHTML = html;
};

// Paginaion
const perPageData = function (page = search.page) {
  search.page = page;

  const start = (page - 1) * search.resultsPerPage;
  const end = page * search.resultsPerPage;

  return search.results.slice(start, end);
};

// Main

// Get the Country Data
const getCountry = function () {
  // render error if input is empty
  if (!inputEl.value) {
    inputEl.classList.add("error");
    inputEl.focus();
    return;
  }
  // render error if selection is empty
  if (!select.value) {
    select.classList.add("error");
    select.focus();
    return;
  }

  // render loader
  renderLoader();

  // process user's entered data
  const url = API_URLS[select.value];
  const country = inputEl.value;

  // empty input field
  inputEl.value = "";

  // get country based on user's selections
  getJSON(`${url}${country}`)
    .then((data) => {
      // clear results array to start over
      search.results = [];
      // push each country data to results array
      data.forEach((country) => {
        search.results.push(country);
      });

      // start pages from 1
      search.page = 1;
      // chop results and get per page data
      const pageData = perPageData();

      // render single page data
      renderCountry(pageData);
    })
    .catch((error) => renderError(error));
};

// Render The Country Data
const renderCountry = function (data) {
  // clear field
  countriesContainer.innerHTML = "";

  // render results number
  showResults(search.results.length);

  // gather all information
  data.forEach((country) => {
    // not every country has coat of arms, so defining alternative htmls
    const coa = `<img src="${country.coatOfArms.svg}"
                    alt="coat of arms of the country"/>`;

    const notFound = `
                <div class="not-found">A Coat of Arms not found!</div>
                     `;

    // not every country has defined currency
    let currenciesName, currenciesSymbol;

    if (country.currencies) {
      currenciesName = Object.values(country.currencies).at(0).name;
    } else {
      currenciesName = "No Information";
    }

    if (country.currencies) {
      currenciesSymbol = Object.values(country.currencies).at(0).symbol;
    } else {
      currenciesSymbol = "";
    }

    // computing population in millions or if less in thousands
    let population;
    if (country.population === 0) {
      population = "Unknown";
    } else if (country.population / 1_000_000 < 0.01) {
      population = `${country.population} thousands`;
    } else {
      population = `${(country.population / 1_000_000).toFixed(2)} million`;
    }

    // defining a country rendering html
    const html = `
      <article class="country">
      <div class="country__data">
      <div>
        <h2 class="c-name">${country.name?.common} <span> ${
      country.flag
    } </span></h2>
      </div>
      <div>
        <h3><span>Official Name: </span>${country.name.official}</h3>
        <p><span>Native Name: </span>${
          Object.values(country.name.nativeName)[0].official
        }</p>
        <p><span>Also Spelled As: </span>${country.altSpellings.join(", ")}</p>
        <p><span>Capital: </span>${
          country.capital?.join(", ") || "No Information"
        }</p>
        <p><span>Language: </span>${Object.values(country.languages).join(
          ", "
        )}</p>
        <p><span>Population: </span>${population}</p>
        <p><span>Area: </span>${country.area / 1000} km</p>
        <p><span>Currency: </span>${currenciesName} (${currenciesSymbol})</p>
        <p><span>Continent: </span>${country.continents}</p>
        <p><span>Region: </span>${country.region}</p>
        <p><span>Subregion: </span>${country.subregion}</p>
        <p><span>Time Zone(s): </span>${country.timezones.join(", ")}</p>
        </div>
        </div>
        <div class="country__images">
          <div class="coa">
          ${country.coatOfArms?.svg ? coa : notFound}
          </div>
          <div class="flag">
            <img src="${country.flags?.svg}" alt="flag of the country"/>
          </div>
        </div>
    </article>
          `;

    // render country data
    countriesContainer.insertAdjacentHTML("beforeend", html);
  });

  // render page buttons
  paginationContainer.innerHTML = renderPagination();
};

const renderPagination = function () {
  const currPage = search.page;
  const numPages = Math.ceil(search.results.length / search.resultsPerPage);

  if (currPage === 1 && numPages > 1) {
    return `
      <button data-goto="${currPage + 1}" class="btn--pagination btn--next">
        <span>Page ${currPage + 1}</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M250.77 643.025h50.255q5.769-61.308 52.513-103.09 46.744-41.782 110.975-41.782 41.282 0 86.013 24.898 44.732 24.898 73.783 69.719h-89.488v50.255h173.64v-173.64h-50.255v88.258q-36.616-55.078-90.014-82.411-53.397-27.334-103.679-27.334-86.179 0-146.692 56.679-60.512 56.679-67.051 138.448Zm229.297 312.974q-78.426 0-147.666-29.92t-120.887-81.544q-51.647-51.624-81.58-120.833-29.933-69.21-29.933-147.635 0-78.836 29.92-148.204 29.92-69.369 81.544-120.682 51.624-51.314 120.833-81.247 69.21-29.933 147.635-29.933 78.836 0 148.204 29.92 69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173 0 78.426-29.92 147.666t-81.21 120.887q-51.291 51.647-120.629 81.58-69.337 29.933-148.173 29.933ZM480 905.744q137.795 0 233.769-96.18Q809.744 713.385 809.744 576q0-137.795-95.975-233.769Q617.795 246.256 480 246.256q-137.385 0-233.564 95.975-96.18 95.974-96.18 233.769 0 137.385 96.18 233.564 96.179 96.18 233.564 96.18ZM480 576Z"/></svg>
      </button>
    `;
  }

  if (currPage === numPages && numPages > 1) {
    return `
      <button data-goto="${currPage - 1}" class="btn--pagination btn--prev">
      <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M250.77 643.025h50.255q5.769-61.308 52.513-103.09 46.744-41.782 110.975-41.782 41.282 0 86.013 24.898 44.732 24.898 73.783 69.719h-89.488v50.255h173.64v-173.64h-50.255v88.258q-36.616-55.078-90.014-82.411-53.397-27.334-103.679-27.334-86.179 0-146.692 56.679-60.512 56.679-67.051 138.448Zm229.297 312.974q-78.426 0-147.666-29.92t-120.887-81.544q-51.647-51.624-81.58-120.833-29.933-69.21-29.933-147.635 0-78.836 29.92-148.204 29.92-69.369 81.544-120.682 51.624-51.314 120.833-81.247 69.21-29.933 147.635-29.933 78.836 0 148.204 29.92 69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173 0 78.426-29.92 147.666t-81.21 120.887q-51.291 51.647-120.629 81.58-69.337 29.933-148.173 29.933ZM480 905.744q137.795 0 233.769-96.18Q809.744 713.385 809.744 576q0-137.795-95.975-233.769Q617.795 246.256 480 246.256q-137.385 0-233.564 95.975-96.18 95.974-96.18 233.769 0 137.385 96.18 233.564 96.179 96.18 233.564 96.18ZM480 576Z"/></svg>
        <span>Page ${currPage - 1}</span>
      </button>
    `;
  }

  if (currPage < numPages) {
    return `
      <button data-goto="${currPage - 1}" class="btn--pagination btn--prev">
      <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M250.77 643.025h50.255q5.769-61.308 52.513-103.09 46.744-41.782 110.975-41.782 41.282 0 86.013 24.898 44.732 24.898 73.783 69.719h-89.488v50.255h173.64v-173.64h-50.255v88.258q-36.616-55.078-90.014-82.411-53.397-27.334-103.679-27.334-86.179 0-146.692 56.679-60.512 56.679-67.051 138.448Zm229.297 312.974q-78.426 0-147.666-29.92t-120.887-81.544q-51.647-51.624-81.58-120.833-29.933-69.21-29.933-147.635 0-78.836 29.92-148.204 29.92-69.369 81.544-120.682 51.624-51.314 120.833-81.247 69.21-29.933 147.635-29.933 78.836 0 148.204 29.92 69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173 0 78.426-29.92 147.666t-81.21 120.887q-51.291 51.647-120.629 81.58-69.337 29.933-148.173 29.933ZM480 905.744q137.795 0 233.769-96.18Q809.744 713.385 809.744 576q0-137.795-95.975-233.769Q617.795 246.256 480 246.256q-137.385 0-233.564 95.975-96.18 95.974-96.18 233.769 0 137.385 96.18 233.564 96.179 96.18 233.564 96.18ZM480 576Z"/></svg>
        <span>Page ${currPage - 1}</span>
      </button>

      <button data-goto="${currPage + 1}" class="btn--pagination btn--next">
        <span>Page ${currPage + 1}</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M250.77 643.025h50.255q5.769-61.308 52.513-103.09 46.744-41.782 110.975-41.782 41.282 0 86.013 24.898 44.732 24.898 73.783 69.719h-89.488v50.255h173.64v-173.64h-50.255v88.258q-36.616-55.078-90.014-82.411-53.397-27.334-103.679-27.334-86.179 0-146.692 56.679-60.512 56.679-67.051 138.448Zm229.297 312.974q-78.426 0-147.666-29.92t-120.887-81.544q-51.647-51.624-81.58-120.833-29.933-69.21-29.933-147.635 0-78.836 29.92-148.204 29.92-69.369 81.544-120.682 51.624-51.314 120.833-81.247 69.21-29.933 147.635-29.933 78.836 0 148.204 29.92 69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173 0 78.426-29.92 147.666t-81.21 120.887q-51.291 51.647-120.629 81.58-69.337 29.933-148.173 29.933ZM480 905.744q137.795 0 233.769-96.18Q809.744 713.385 809.744 576q0-137.795-95.975-233.769Q617.795 246.256 480 246.256q-137.385 0-233.564 95.975-96.18 95.974-96.18 233.769 0 137.385 96.18 233.564 96.179 96.18 233.564 96.18ZM480 576Z"/></svg>
      </button>
    `;
  }

  return "";
};
