function openSettings() {
    browser.runtime.openOptionsPage().then(() => {
    }).catch((error) => {
      console.error('Failed to open options page:', error);
    });
}

function sendActionWithSince(name) {
  browser.runtime.sendMessage({ action: name, since: window.clearSince });
}

function startAllCleaner() {
    sendActionWithSince('clearAll')
}

function startHistoryCleaner() {
    sendActionWithSince('clearHistory')
}

function startCookiesCleaner() {
    browser.runtime.sendMessage({ action: 'clearCookies' });
}

function startLocalStorageCleaner() {
    browser.runtime.sendMessage({ action: 'clearLocalStorage' });
}

function startCacheCleaner() {
    browser.runtime.sendMessage({ action: 'clearCache' });
}

function startIndexedDbCleaner() {
    browser.runtime.sendMessage({ action: 'clearIndexedDB' });
}

async function fetchSinceFromLocal() {
  // fetch extension data
  let data = await browser.storage.local.get(['since']);
  if (data.since !== undefined) {
    window.clearSince = data.since
  }
}

function clearListeners() {
  document.getElementById('settings').removeEventListener('click', openSettings);
  document.getElementById('allDataButton').removeEventListener('click', startAllCleaner);
  document.getElementById('historyButton').removeEventListener('click', startHistoryCleaner);
  document.getElementById('cookieButton').removeEventListener('click', startCookiesCleaner);
  document.getElementById('localStorageButton').removeEventListener('click', startLocalStorageCleaner);
  document.getElementById('cacheButton').removeEventListener(
    'click', 
    startCacheCleaner,
  );
  document.getElementById('indexedDbButton').removeEventListener(
    'click', 
    startIndexedDbCleaner,
  );
  document.removeEventListener('DOMContentLoaded', init);
  window.removeEventListener("pagehide", clearListeners);
}

function init() {
  document.getElementById('settings').addEventListener(
    'click', 
    openSettings,
  );
  document.getElementById('allDataButton').addEventListener(
    'click', 
    startAllCleaner,
  );
  document.getElementById('historyButton').addEventListener(
    'click', 
    startHistoryCleaner,
  );
  document.getElementById('cookieButton').addEventListener(
    'click', 
    startCookiesCleaner,
  );
  document.getElementById('localStorageButton').addEventListener(
    'click', 
    startLocalStorageCleaner,
  );
  document.getElementById('cacheButton').addEventListener(
    'click', 
    startCacheCleaner,
  );
  document.getElementById('indexedDbButton').addEventListener(
    'click', 
    startIndexedDbCleaner,
  );
}

// main
fetchSinceFromLocal();
document.addEventListener('DOMContentLoaded', init);
// clean on pagehide
window.addEventListener("pagehide", clearListeners);
