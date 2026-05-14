chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL('content.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement).appendChild(s);
    }
  });
});
