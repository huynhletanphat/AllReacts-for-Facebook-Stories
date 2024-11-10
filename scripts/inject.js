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
