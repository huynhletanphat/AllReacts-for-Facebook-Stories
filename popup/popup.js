// Lấy phần tử toggle từ DOM
const toggle = document.getElementById('toggle-switch');

// Khi trạng thái của toggle thay đổi (chuyển qua lại giữa ON/OFF)
toggle.addEventListener('change', function () {
    const isChecked = toggle.checked; // Kiểm tra xem toggle có được bật hay không
    // Lưu trạng thái của toggle vào chrome.storage để lưu trữ dữ liệu
    chrome.storage.sync.set({ toggleState: isChecked }, function () {
        console.log('Toggle state saved:', isChecked); // Ghi log khi trạng thái đã được lưu
    });
});

// Tìm phần tử mũi tên (nút đóng popup)
const closeButton = document.querySelector('.close-btn');

// Lắng nghe sự kiện click vào mũi tên để đóng popup
closeButton.addEventListener('click', function () {
    window.close(); // Đóng popup khi nhấn vào mũi tên
});
document.querySelectorAll(".extension-info").forEach(function (item) {
    item.addEventListener("click", function () {
        const url = this.getAttribute("data-url");
        if (chrome.tabs) {
            chrome.tabs.create({ url: url });
        } else {
            window.open(url, "_blank");
        }
    });
});


// Khi popup được mở, đọc trạng thái toggle từ chrome.storage
chrome.storage.sync.get('toggleState', function (data) {
    // Nếu không có trạng thái lưu trước đó (lần đầu mở popup), mặc định là false
    toggle.checked = data.toggleState !== undefined ? data.toggleState : false;
});
