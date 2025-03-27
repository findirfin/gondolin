document.addEventListener('DOMContentLoaded', function() {
  const content = document.getElementById('content');
  content.textContent = 'Extension loaded!';
  
  document.getElementById('openFull').addEventListener('click', () => {
    chrome.tabs.create({ url: 'fullpage.html' });
    chrome.sidePanel.close();
  });
});
