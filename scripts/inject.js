(function() {
    // Lấy trạng thái của toggle từ chrome.storage
    chrome.storage.sync.get('toggleState', function(data) {
        // Kiểm tra nếu trạng thái toggle là true
        if (data.toggleState === true) {
            // Tạo phần tử <script> để chèn script 'unseen.js' vào trang
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('scripts/unseen.js'); // Đường dẫn đến script unseen.js trong extension
            script.onload = function() {
                this.remove(); // Loại bỏ script sau khi đã tải và thực thi xong
                console.log('Hide seen FBS enabled'); // In ra console khi chức năng đã được kích hoạt
            };
            // Chèn phần tử <script> vào head hoặc html của trang
            (document.head || document.documentElement).appendChild(script);
        } else {
            // In ra console khi chức năng không được kích hoạt
            console.log('Hide seen FBS NOT enabled');
        }
    });
})();

(async () => {
    try {
        // Lấy emoji.json từ tài nguyên của extension
        const emojiJson = await fetch(chrome.runtime.getURL('data/emoji.json'));
        const EMOJI_LIST = await emojiJson.json();

        // Lấy danh sách URL hình ảnh cần preload
        const imageUrls = EMOJI_LIST.flatMap(emoji => [emoji.image_url, emoji.image_anim_url]);

        // Gọi hàm preload để tải trước hình ảnh
        preloadImages(imageUrls);
    } catch (error) {
        console.error("Failed to preload emoji images:", error);
    }
})();

// Hàm preload hình ảnh
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url; // Tải hình ảnh
    });
        console.log(`Preloading image emoji`);
}

