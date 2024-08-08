function validateInput(e) {
  let value = e.target.value;
  if (value.length > 3) {
    value = value.slice(0, 3); // Limit to 3 digits
  }
  e.target.value = value;
}

// Define the event listener function separately
function handlePageHide() {
  // Submit the sinceLast value
  let sinceNew = document.getElementById("sinceLast").value;
  sinceNew = Number(sinceNew);

  browser.runtime.sendMessage({
    action: "saveSince",
    since: sinceNew,
  });

  document
    .getElementById("sinceLast")
    .removeEventListener("input", validateInput);
  // Remove the event listener after execution
  document.removeEventListener("DOMContentLoaded", init);
  window.removeEventListener("pagehide", handlePageHide);
}

async function init() {
  let data = await browser.storage.local.get(["since"]);
  if (data.since === undefined) {
    data = {
      since: 0,
    };
  }
  document.getElementById("sinceLast").value = data.since;
  document
    .getElementById("sinceLast")
    .addEventListener("input", validateInput);
}

// Add the event listener
window.addEventListener("pagehide", handlePageHide);
// main
document.addEventListener("DOMContentLoaded", init);
