// popup.js
document.getElementById('siteForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const siteUrl = document.getElementById('siteUrl').value.trim();
  const siteTime = parseInt(document.getElementById('siteTime').value) || 10;

  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || {};
    blockedSites[siteUrl] = siteTime;

    chrome.storage.sync.set({ blockedSites }, () => {
      displayBlockedSites();
      document.getElementById('siteForm').reset();
    });
  });
});

// Display the blocked sites in a list
function displayBlockedSites() {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';

    const blockedSites = result.blockedSites || {};
    for (const [site, time] of Object.entries(blockedSites)) {
      const listItem = document.createElement('li');
      listItem.textContent = `${site}: ${time} minutes`;
      siteList.appendChild(listItem);
    }
  });
}

// Initial display of blocked sites
displayBlockedSites();

document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('resetForm');
  const resetTimeInput = document.getElementById('resetTime');
  const resetStatus = document.getElementById('resetStatus');

  // Load existing reset time
  chrome.storage.sync.get(['resetTime'], (data) => {
    if (data.resetTime) {
      resetTimeInput.value = data.resetTime; // Set the input to the stored time
    }
  });

  // Handle reset time form submission
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const resetTime = resetTimeInput.value;
    if (resetTime) {
      chrome.storage.sync.set({ resetTime }, () => {
        resetStatus.textContent = `Reset time set to ${resetTime}`;
        resetStatus.style.color = 'green';

        // Notify background.js to reschedule the alarm
        chrome.runtime.sendMessage({ action: 'rescheduleReset', resetTime });
      });
    }
  });
});
