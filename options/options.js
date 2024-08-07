// Define the event listener function separately
function handlePageHide() {
  // Submit the sinceLast value
  let sinceNew = document.getElementById('sinceLast').value;
  
  browser.runtime.sendMessage({
    action: 'saveSince',
    since: sinceNew,
  });
  
  // Remove the event listener after execution
  document.removeEventListener('DOMContentLoaded', init);
  window.removeEventListener("pagehide", handlePageHide);
}

async function init() {
  let data = await browser.storage.local.get(['since']);
  if (data.since === undefined) {
    data = {
      since: 0,
    }
  }
  document.getElementById('sinceLast').value = data.since;
}

// Add the event listener
window.addEventListener("pagehide", handlePageHide);
// main
document.addEventListener('DOMContentLoaded', init);
