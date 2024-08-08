const millisecondsPerDay = 86400000;

function notify(title, message) {
  browser.notifications.create(`clear-data-min-info`, {
    type: "basic",
    title: title,
    message: message,
  });
}

function notifySuccess(message) {
  notify("Completed", message);
}

function notifyError(message) {
  notify("Error", message);
}

function calculateSince(preference) {
  if (preference == 0) {
    return 0;
  }
  return new Date().getTime() - preference * millisecondsPerDay;
}

// Clear all cookies from all domains
function clearAllCookies() {
  browser.cookies
    .getAll({})
    .then((cookies) => {
      for (let cookie of cookies) {
        browser.cookies
          .remove({
            name: cookie.name,
            url: cookie.domain
              ? `http${cookie.secure ? "s" : ""}://${cookie.domain}`
              : "",
            storeId: cookie.storeId,
          })
          .catch(() => {
            console.log(`error while deleting a cookie from ${cookie.domain}`);
          });
      }
    })
    .catch((e) => {
      console.log(`error on cookies clear: ${e}`);
      notifyError("Cookies wasn't cleared");
    });
}

// Clear browser history
function clearHistory(since) {
  let sinceUnix = calculateSince(since);

  browser.browsingData
    .removeHistory({
      since: sinceUnix,
    })
    .catch((e) => {
      console.log(`error on history clear: ${e}`);
      notifyError("History wasn't cleared");
    });
}

function clearCache() {
  browser.browsingData
    .remove(
      {},
      {
        cache: true,
      },
    )
    .catch((e) => {
      console.log(`error on cache clear: ${e}`);
      notifyError("Cache wasn't cleared");
    });
}

function clearIndexedDB() {
  browser.browsingData
    .remove(
      {},
      {
        indexedDB: true,
      },
    )
    .catch((e) => {
      console.log(`error on indexedDB clear: ${e}`);
      notifyError("IndexedDB wasn't cleared");
    });
}

// Clear local storage and other site data
function clearLocalStorage() {
  browser.browsingData
    .removeLocalStorage({})
    .catch((e) => {
      console.log(`error on localStorage clear: ${e}`);
      notifyError("LocalStorage wasn't cleared");
    });
}

function clearAllData(since) {
  clearAllCookies();
  clearLocalStorage();
  clearHistory(since);
  clearCache();
  clearIndexedDB();
}

function openSettings() {
  browser.runtime
    .openOptionsPage()
    .then(() => { })
    .catch((error) => {
      console.error("Failed to open options page:", error);
      notifyError("Failed to open options page");
    });
}

function onInstallation(details) {
  if (details.reason === "install") {
    openSettings();
  }
}

function onMessage(message) {
  switch (message.action) {
    case "saveSince":
      browser.storage.local.set({
        since: message.since,
      });
      break;
    case "clearCache":
      clearCache();
      notifySuccess("Cache is cleared");
      break;
    case "clearIndexedDB":
      clearIndexedDB();
      notifySuccess("IndexedDB are deleted");
      break;
    case "clearCookies":
      clearAllCookies();
      notifySuccess("Cookies are deleted");
      break;
    case "clearHistory":
      clearHistory(message.since);
      notifySuccess("History is deleted");
      break;
    case "clearLocalStorage":
      clearLocalStorage();
      notifySuccess("LocalStorage is deleted");
      break;
    case "clearAll":
      clearAllData(message.since);
      notifySuccess("All data deleted");
      break;
    default:
      return Promise.resolve({ status: "error", message: "Unknown action" });
  }
  // if we don't want to respond
  return false;
}

function onSuspend() {
  browser.runtime.onInstalled.removeListener(onInstallation);
  browser.runtime.onSuspend.removeListener(onSuspend);
  browser.runtime.onMessage.removeListener(onMessage);
}

function init() {
  browser.runtime.onInstalled.addListener(onInstallation);
  browser.runtime.onSuspend.addListener(onSuspend);
  browser.runtime.onMessage.addListener(onMessage);
}

init();
