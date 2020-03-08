export { default as throttle } from "lodash.throttle";

export function waitUntil(check, interval = 500, timeout = 60000) {
  return new Promise((resolve, reject) => {
    let intervalId, timeoutId;
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      reject();
    }, timeout);
    intervalId = setInterval(() => {
      if (!check()) return;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      resolve();
    }, interval);
  });
}

export function waitUntilEl(selector, interval) {
  return waitUntil(() => document.querySelector(selector), interval).catch(
    () => {
      throw new Error(`Element is not showing up: ${selector}`);
    }
  );
}

export function waitUntilElements(selectorArray = [], interval) {
  return Promise.all(selectorArray.map(s => waitUntilEl(s, interval)));
}

export const $ = selector => document.querySelector(selector);

export const getOptions = () =>
  new Promise(resolve =>
    chrome.storage.sync.get(null, obj => {
      resolve({
        subscribedOnly: false,
        includeIds: [],
        excludeIds: [],
        minDuration: 10,
        ...obj
      });
    })
  );

export const setOption = obj =>
  new Promise(resolve => chrome.storage.sync.set(obj, resolve));
