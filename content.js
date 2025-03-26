// Hàm injectHook dùng để thêm một script vào trang web
function injectHook(url, type = '') {
    const hookScript = document.createElement("script");
    if (type !== '') hookScript.type = "module";
    hookScript.src = url;
    hookScript.onload = function () {
        this.remove();
    };
    (document.head || document.body || document.documentElement).appendChild(hookScript);
}

// Hàm getRandom trả về một số ngẫu nhiên trong khoảng [min, max]
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Xác định API tương thích cho cả Chrome và Firefox
const extension = typeof browser !== 'undefined' ? browser : chrome;

// Lắng nghe các tin nhắn từ extension
extension.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'TabUpdated' && document.location.href.includes('https://www.facebook.com/stories')) {
        injectHook(extension.runtime.getURL(`/scripts/story.js?v=${getRandom(1, 100)}`), 'module');
    }
});