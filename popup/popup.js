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
    .then(() => { })
    .catch((error) => {
      console.error("Failed to open options page:", error);
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

function hideElement(elementId) {
  document.getElementById(elementId).classList.add("displayOff");
}

function revealElement(elementId) {
  document.getElementById(elementId).classList.remove("displayOff");
}

function spawnButtonWithIdentity(identity) {
  const row = document.createElement("div");
  const img = document.createElement("div");
  // hack to recolor svg from url
  img.style = `
    display: inline-block;
    background-color: ${identity.color};
    mask-image: url(${identity.iconUrl});
    mask-size: 20px;
    height: 20px;
    width: 20px;
  `;
  row.appendChild(img);

  const button = document.createElement("button");
  button.className = "identity";
  button.innerText = identity.name;
  button.style = `background: ${identity.colorCode}17;`;
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
  let div = document.getElementById("chooseIdentity");

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

    // move to a function?
    // add button back on identity choose
    const row = document.createElement("div");
    const buttonBack = document.createElement("button");
    buttonBack.innerHTML = "Back";
    buttonBack.id = "identityBackButton";
    buttonBack.addEventListener("click", backFromIdentities);
    row.appendChild(buttonBack);
    div.appendChild(buttonBack);

    for (const identity of identities) {
      const buttonDiv = spawnButtonWithIdentity(identity);
      div.appendChild(buttonDiv);
    }
  });
}

function getIdentities() {
  if (document.getElementsByClassName("identity").length == 0) {
    spawnIdentities();
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
  // fetch extension data
  let data = await browser.storage.local.get(["since"]);
  if (data.since !== undefined) {
    window.clearSince = data.since;
    return;
  }
}

function addClickOnElement(elementId, callback) {
  document.getElementById(elementId).addEventListener("click", callback);
}

function removeClickOnElement(elementId, callback) {
  document.getElementById(elementId).removeEventListener("click", callback);
}

function clearListeners() {
  removeClickOnElement("identitiesButton", getIdentities);
  removeClickOnElement("settings", openSettings);
  removeClickOnElement("allDataButton", startAllCleaner);
  removeClickOnElement("historyButton", startHistoryCleaner);
  removeClickOnElement("cookieButton", startCookiesCleaner);
  removeClickOnElement("localStorageButton", startLocalStorageCleaner);
  removeClickOnElement("cacheButton", startCacheCleaner);
  removeClickOnElement("indexedDbButton", startIndexedDbCleaner);
  clearIdentitiesListeners();
  document.removeEventListener("DOMContentLoaded", init);
  window.removeEventListener("pagehide", clearListeners);
}

function init() {
  addClickOnElement("identitiesButton", getIdentities);
  addClickOnElement("settings", openSettings);
  addClickOnElement("allDataButton", startAllCleaner);
  addClickOnElement("historyButton", startHistoryCleaner);
  addClickOnElement("cookieButton", startCookiesCleaner);
  addClickOnElement("localStorageButton", startLocalStorageCleaner);
  addClickOnElement("cacheButton", startCacheCleaner);
  addClickOnElement("indexedDbButton", startIndexedDbCleaner);
}

// main
fetchSinceFromLocal();
document.addEventListener("DOMContentLoaded", init);
// clean on popup close
window.addEventListener("pagehide", clearListeners);
