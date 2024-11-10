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
