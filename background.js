// Lắng nghe sự kiện khi một tab được cập nhật
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // Kiểm tra nếu trạng thái của tab đã hoàn thành tải (complete) và URL của tab chứa "https://www.facebook.com/stories"
    if (changeInfo.status === "complete" && tab.url.includes("https://www.facebook.com/stories")) {
        // Tiến hành thực thi script 'story.js' trong tab hiện tại
        chrome.scripting.executeScript({
            target: { tabId: tabId }, // Chỉ định tab mà script sẽ được thực thi
            files: ['scripts/story.js'] // Tệp script cần được chèn vào tab
        });
    }
});

function checkUpdate() {
    fetch("https://raw.githubusercontent.com/DuckCIT/AllReacts-for-Facebook-Stories/main/data/version.json")
        .then(response => response.json())
        .then(data => {
            const currentVersion = chrome.runtime.getManifest().version;

            if (data.version > currentVersion) {
                chrome.storage.local.get(["update_notified"], (result) => {
                    if (!result.update_notified) {
                        chrome.storage.local.set({ update_notified: true });
                        chrome.notifications.create("update_notification", {
                            type: "basic",
                            iconUrl: "icons/icon128.png",
                            title: "New Update Available!",
                            message: `A new version (${data.version}) is available. Click here to update.`,
                            priority: 2
                        });
                        chrome.notifications.onClicked.addListener((notificationId) => {
                            if (notificationId === "update_notification") {
                                chrome.tabs.create({ url: "https://github.com/DuckCIT/AllReacts-for-Facebook-Stories" });
                            }
                        });
                    }
                });
            }
        })
        .catch(() => {});
}

chrome.runtime.onStartup.addListener(checkUpdate);
chrome.runtime.onInstalled.addListener(checkUpdate);
