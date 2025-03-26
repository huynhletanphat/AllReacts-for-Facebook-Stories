const extension = typeof browser !== 'undefined' ? browser : chrome;

// Lắng nghe sự kiện khi một tab được cập nhật
extension.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url.includes("https://www.facebook.com/stories")) {
        extension.scripting.executeScript({
            target: { tabId: tabId },
            files: ['scripts/story.js']
        });
    }
});

extension.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkUpdate") {
        fetch("https://raw.githubusercontent.com/DuckCIT/AllReacts-for-Facebook-Stories/main/data/version.json")
            .then(response => response.json())
            .then(data => {
                sendResponse({ data });
            })
            .catch(() => {
                sendResponse({ data: {} }); // Trả về rỗng nếu lỗi
            });
        return true; // Giữ channel mở để gửi response bất đồng bộ
    }
});

function checkUpdate() {
    fetch("https://raw.githubusercontent.com/DuckCIT/AllReacts-for-Facebook-Stories/main/data/version.json")
        .then(response => response.json())
        .then(data => {
            const currentVersion = extension.runtime.getManifest().version;

            if (data.version > currentVersion) {
                extension.storage.local.get(["update_notified"], (result) => {
                    if (!result.update_notified) {
                        extension.storage.local.set({ update_notified: true });
                        extension.notifications.create("update_notification", {
                            type: "basic",
                            iconUrl: "icons/icon128.png",
                            title: "New Update Available!",
                            message: `A new version (${data.version}) is available. Click here to update.`,
                            priority: 2
                        });
                        extension.notifications.onClicked.addListener((notificationId) => {
                            if (notificationId === "update_notification") {
                                extension.tabs.create({ url: "https://github.com/DuckCIT/AllReacts-for-Facebook-Stories" });
                            }
                        });
                    }
                });
            }
        })
        .catch(() => {});
}

extension.runtime.onStartup.addListener(checkUpdate);
extension.runtime.onInstalled.addListener(checkUpdate);