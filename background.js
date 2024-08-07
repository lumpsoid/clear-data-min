const millisecondsPerDay = 86400000;

function calculateSince(preference) {
  if (preference == 0) {
    return preference;
  }
  return new Date().getTime() - (preference * millisecondsPerDay);
}

// Clear all cookies from all domains
function clearAllCookies() {
    browser.cookies.getAll({}).then(cookies => {
        for (let cookie of cookies) {
            browser.cookies.remove({
                name: cookie.name,
                url: cookie.domain ? `http${cookie.secure ? 's' : ''}://${cookie.domain}` : '',
                storeId: cookie.storeId
            }).catch(() => console.log(`error while deleting a cookie from ${cookie.domain}`));
        }
    }).catch((e) => console.log(`error on cookies clear: ${e}`));
    console.log('clear cookie ended');
}

// Clear browser history
function clearHistory(since) {
    let sinceUnix = calculateSince(since);

    browser.browsingData.removeHistory({
        since: sinceUnix
    }).catch((e) => console.log(`error on history clear: ${e}`));
    console.log('clear history ended');
}

function clearCache() {
    browser.browsingData.remove({}, {
      cache: true,
    }).catch((e) => console.log(`error on cache clear: ${e}`));
    console.log('clear cache ended');
}

function clearIndexedDB() {
    browser.browsingData.remove({}, {
      indexedDB: true,
    }).catch((e) => console.log(`error on indexedDB clear: ${e}`));
    console.log('clear indexedDB ended');
}

// Clear local storage and other site data
function clearLocalStorage() {
    browser.browsingData.removeLocalStorage({}).catch((e) => console.log(`error on localStorage clear: ${e}`));
    console.log('clear localStorage ended');
}

function clearAllData(since) {
    clearAllCookies();
    clearLocalStorage();
    clearHistory(since);
    clearCache();
    clearIndexedDB();
    console.log('clear all data ended');
}

function openSettings() {
    browser.runtime.openOptionsPage().then(() => {
    }).catch((error) => {
      console.error('Failed to open options page:', error);
    });
}

function onInstallation(details) {
  if (details.reason === 'install') {
    openSettings();
  }
}

function onMessage(message) {
  console.log('message:', message);
  switch (message.action) {
    case 'saveSince':
      browser.storage.local.set({
        since: message.since,
      });
      break;
    case 'clearCache':
      clearCache();
      break;
    case 'clearIndexedDB':
      clearIndexedDB();
      break;
    case 'clearCookies':
      clearAllCookies();
      break;
    case 'clearHistory':
      clearHistory(message.since);
      break;
    case 'clearLocalStorage':
      clearLocalStorage();
      break;
    case 'clearAll':
      clearAllData(message.since);
      break;
    default:
      return Promise.resolve({ status: "error", message: "Unknown action" });
  }
  // if we don't want to respond
  return false;
  
}

function onSuspend() {
  console.log('Background script is unloading, cleaning up...');
  browser.runtime.onInstalled.removeListener(onInstallation);
  browser.runtime.onSuspend.removeListener(onSuspend);
  browser.runtime.onMessage.removeListener(onMessage);
}

function init() {
  browser.runtime.onInstalled.addListener(onInstallation);
  browser.runtime.onSuspend.addListener(onSuspend);
  browser.runtime.onMessage.addListener(onMessage);
}

init()
