function notify(message) {
  browser.notifications.create(`clear-data-min-info`, {
    type: "basic",
    title: "clear-data-min",
    message: message,
  });
}

function openSettings() {
  browser.runtime
    .openOptionsPage()
    .then(() => {
      window.close();
    });
}

function sendActionWithSince(name) {
  browser.runtime.sendMessage({ action: name, since: window.clearSince });
}

function startAllCleaner() {
  sendActionWithSince("clearAll");
}

function startHistoryCleaner() {
  sendActionWithSince("clearHistory");
}

function startCookiesCleaner() {
  browser.runtime.sendMessage({ action: "clearCookies" });
}

function chooseIdentityToCookieClear(event) {
  browser.runtime.sendMessage({
    action: "clearIdentityCookies",
    identity: event.target.dataset.identity,
    name: event.target.dataset.name,
  });
}

function revealElement(id) {
  document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

function spawnButtonWithIdentity(identity) {
  const row = document.createElement("div");
  row.classList.add("button-row");

  const button = document.createElement("button");
  button.innerText = identity.name;
  button.className = "identity";
  button.style = `background: ${identity.colorCode} 10px 50% no-repeat url(${identity.iconUrl});`
  button.dataset.identity = identity.cookieStoreId;
  button.dataset.name = identity.name;
  button.addEventListener("click", chooseIdentityToCookieClear);
  row.appendChild(button);

  return row;
}

function clearIdentitiesListeners() {
  const identities = document.getElementsByClassName("identity");
  if (identities.length == 0) return;

  for (const identity in identities) {
    identity.removeEventListener("click", chooseIdentityToCookieClear);
  }
  document
    .getElementById("identityBackButton")
    .removeEventListener("click", backFromIdentities);
}

function backFromIdentities() {
  revealElement("defaultButtons");
  hideElement("chooseIdentity");
}

function spawnIdentities() {
  let chooseIdentityDiv = document.getElementById("chooseIdentity");

  if (browser.contextualIdentities === undefined) {
    notify(
      "browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.",
    );
    return;
  }
  browser.contextualIdentities.query({}).then((identities) => {
    if (!identities.length) {
      notify("No identities returned from the API.");
      return;
    }

    for (const identity of identities) {
      const buttonDiv = spawnButtonWithIdentity(identity);
      chooseIdentityDiv.appendChild(buttonDiv);
    }
  });
}

function getIdentities() {
  if (document.getElementsByClassName("identity").length == 0) {
    spawnIdentities();
    revealElement("chooseIdentity");
  } else {
    revealElement("chooseIdentity");
  }
  hideElement("defaultButtons");
}

function startLocalStorageCleaner() {
  browser.runtime.sendMessage({ action: "clearLocalStorage" });
}

function startCacheCleaner() {
  browser.runtime.sendMessage({ action: "clearCache" });
}

function startIndexedDbCleaner() {
  browser.runtime.sendMessage({ action: "clearIndexedDB" });
}

async function fetchSinceFromLocal() {
  try {
    // Fetch extension data
    let data = await browser.storage.local.get(["since"]);

    // Check if "since" is undefined
    if (data.since === undefined) {
      notify("Check settings to write since option.");
      return;
    }

    // Assign "since" to window.clearSince if it's not already set or different
    if (window.clearSince !== data.since) {
      window.clearSince = data.since;
      return;
    }

  } catch (error) {
    console.error('Error fetching data from local storage:', error);
    notify("An error occurred while fetching the 'since' option. Please try again.");
  }
}

function addClickOnElement(elementId, callback) {
  document.getElementById(elementId).addEventListener("click", callback);
}

function addClickOnElements(elements) {
  elements.forEach(({ id, callback }) => {
    addClickOnElement(id, callback);
  });
}

function removeClickOnElement(elementId, callback) {
  document.getElementById(elementId).removeEventListener("click", callback);
}

function removeClickOnElements(elements) {
  elements.forEach(({ id, callback }) => {
    removeClickOnElement(id, callback);
  });
}

// Array of objects to map element IDs to their callback functions
const elementCallbacks = [
  { id: "identityBackButton", callback: backFromIdentities },
  { id: "identitiesButton", callback: getIdentities },
  { id: "settings", callback: openSettings },
  { id: "allDataButton", callback: startAllCleaner },
  { id: "historyButton", callback: startHistoryCleaner },
  { id: "cookieButton", callback: startCookiesCleaner },
  { id: "localStorageButton", callback: startLocalStorageCleaner },
  { id: "cacheButton", callback: startCacheCleaner },
  { id: "indexedDbButton", callback: startIndexedDbCleaner }
];

function clearListeners() {
  removeClickOnElements(elementCallbacks);
  clearIdentitiesListeners();
  document.removeEventListener("DOMContentLoaded", init);
  window.removeEventListener("pagehide", clearListeners);
}

function init() {
  addClickOnElements(elementCallbacks);
}

// main
fetchSinceFromLocal();
document.addEventListener("DOMContentLoaded", init);
// clean on popup close
window.addEventListener("pagehide", clearListeners);
