document.addEventListener('DOMContentLoaded', function() {
  const content = document.getElementById('content');
  content.textContent = 'Extension loaded!';
  
  document.getElementById('openFull').addEventListener('click', async () => {
    try {
      // Get current tab first
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // Create new tab with fullpage
      await chrome.tabs.create({ url: 'fullpage.html' });
      // Close side panel on the original tab
      await chrome.sidePanel.close({ tabId: tab.id });
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
