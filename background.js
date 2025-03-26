chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.sidePanel.setOptions({
      path: 'popup.html',
      enabled: true
    });
    console.log('Extension installed and side panel configured');
  } catch (error) {
    console.error('Error setting up side panel:', error);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});
