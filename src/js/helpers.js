import { TIMEOUT_SEC } from "./config.js";

const timeout = function (sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${sec} seconds`));
    }, sec * 1000);
  });
};

export const getJSON = function (url) {
  return Promise.race([fetch(url), timeout(TIMEOUT_SEC)])
    .then((response) => {
      if (!response.ok)
        throw new Error(
          `Nothing was found with provided search options (${response.status})`
        );

      return response.json();
    })
    .catch((error) => {
      throw error;
    });
};
