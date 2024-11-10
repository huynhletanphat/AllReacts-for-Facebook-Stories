// Hàm injectHook dùng để thêm một script vào trang web
function injectHook(url, type = '') {
    const hookScript = document.createElement("script"); // Tạo một phần tử script mới
    if (type !== '') hookScript.type = "module"; // Nếu type khác rỗng, chỉ định loại là module
    hookScript.src = url; // Gán URL của script
    hookScript.onload = function () {
        this.remove(); // Khi script được tải xong, tự động xóa script khỏi DOM
    };
    // Thêm script vào head hoặc body hoặc document (tùy vào phần tử có sẵn)
    (document.head || document.body || document.documentElement).appendChild(hookScript);
}

// Hàm getRandom trả về một số ngẫu nhiên trong khoảng [min, max]
function getRandom(min, max) {
    return Math.random() * (max - min) + min; // Công thức tính số ngẫu nhiên trong khoảng
}

// Lắng nghe các tin nhắn từ extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Nếu tin nhắn có nội dung là 'TabUpdated' và URL của trang hiện tại là Facebook Stories
    if (request.message === 'TabUpdated' && document.location.href.includes('https://www.facebook.com/stories')) {
        // Tiến hành chèn một script vào trang, URL của script được tạo từ extension
        injectHook(chrome.extension.getURL(`/lib/story.js?v=${getRandom(1, 100)}`), 'module');
    }
});
