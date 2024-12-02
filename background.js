// Utility Functions
function observeAndRemoveElements() {
  function removeMediaElements() {
    // Remove <img>, <video>, <iframe> elements
    document.querySelectorAll('img, video, iframe').forEach(el => el.remove());

    // Remove elements with a background image
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      el.style.backgroundImage = 'none';
    });
  }

  removeMediaElements();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG' || node.tagName === 'VIDEO' || node.tagName === 'IFRAME') {
          node.remove();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Remove media within added nodes
          node.querySelectorAll('img, video, iframe').forEach(el => el.remove());

          // Remove background images within added nodes
          if (node.style && node.style.backgroundImage) {
            node.style.backgroundImage = 'none';
          }
          node.querySelectorAll('[style*="background-image"]').forEach(el => {
            el.style.backgroundImage = 'none';
          });
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Main Listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || {};
      const url = new URL(tab.url);
      const siteKey = Object.keys(blockedSites).find(site => url.hostname.includes(site));

      if (siteKey) {
        const siteTimeLimit = blockedSites[siteKey];

        chrome.storage.local.get([`${siteKey}_startTime`, `${siteKey}_timeLimit`], (data) => {
          const currentTime = new Date().getTime();
          const startTime = data[`${siteKey}_startTime`] || currentTime;
          const timeLimit = data[`${siteKey}_timeLimit`] || siteTimeLimit * 60 * 1000;

          // Save start time and time limit if not already stored
          if (!data[`${siteKey}_startTime`]) {
            chrome.storage.local.set({
              [`${siteKey}_startTime`]: currentTime,
              [`${siteKey}_timeLimit`]: timeLimit,
            });
          }

          const elapsedTime = currentTime - startTime;

          if (elapsedTime >= timeLimit) {
            console.log(`Time limit reached for ${siteKey}`);
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: observeAndRemoveElements,
            }).catch((error) => console.error("Error executing script:", error));
          } else {
            const timeRemaining = Math.max((timeLimit - elapsedTime) / 1000, 0);
            console.log(`${siteKey} time remaining: ${timeRemaining.toFixed(1)} seconds`);
          }
        });
      }
    });
  }
});

// Schedule a reset at midnight
chrome.runtime.onInstalled.addListener(() => {
  scheduleDailyReset();
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    resetBlockedSites();
  }
});

// Function to schedule the daily reset
function scheduleDailyReset(userResetTime) {
  const now = new Date();
  const resetTime = userResetTime
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...userResetTime.split(':').map(Number))
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0); // Default: midnight

  if (resetTime < now) resetTime.setDate(resetTime.getDate() + 1);

  const timeUntilReset = resetTime - now;

  chrome.alarms.clear('dailyReset', () => {
    chrome.alarms.create('dailyReset', {
      delayInMinutes: timeUntilReset / 60000,
      periodInMinutes: 1440,
    });
    console.log(`Daily reset scheduled for ${resetTime.toLocaleTimeString()}`);
  });
}


// Function to reset blocked sites
function resetBlockedSites() {
  chrome.storage.sync.set({ blockedSites: {} }, () => {
    console.log('Blocked sites reset to normal state.');
  });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'rescheduleReset' && message.resetTime) {
    scheduleDailyReset(message.resetTime);
  }
});


// Reset blocked sites when the alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    resetBlockedSites();
  }
});


