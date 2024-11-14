(async () => {
    // Kiểm tra nếu đã có nút 'btn-react' thì không làm gì cả
    if (document.getElementsByClassName('btn-react').length > 0) return;

    try {
        // Lấy dữ liệu emoji từ file JSON
        const emojiJson = await fetch(chrome.runtime.getURL('data/emoji.json'));

        // Chuyển đổi dữ liệu JSON thành đối tượng JavaScript
        const EMOJI_LIST = await emojiJson.json();

        // Gọi hàm để tải modal với danh sách emoji
        loadModal(EMOJI_LIST);
    } catch (e) {
        // Nếu có lỗi xảy ra trong quá trình tải emoji, hiển thị thông báo lỗi
        showToast("Failed to load emojis. Please try again");
    }
})();

function getEmojiNameFromUrl(url) {
    // Tách URL thành các phần nhỏ bằng dấu '/'
    const parts = url.split('/');

    // Lấy phần cuối cùng của URL, đó là tên file
    const fileName = parts[parts.length - 1];

    // Lấy tên emoji từ tên file (trước dấu '_') và thay thế dấu '-' bằng dấu cách
    const emojiName = fileName.split('_')[0].replace(/-/g, ' ');

    return emojiName;
}

function checkUpdate(linkWithTooltip) {
    // Kiểm tra cập nhật
    fetch("https://raw.githubusercontent.com/DuckCIT/AllReacts-for-Facebook-Stories/main/data/version.json")
        .then(response => response.json())
        .then(data => {
            const currentVersion = chrome.runtime.getManifest().version;
            console.log(data.version, currentVersion);
            if (data.version > currentVersion) {
                linkWithTooltip.setAttribute('tooltip', 'Please check for update here v' + data.version);
                linkWithTooltip.setAttribute('href', 'https://github.com/DuckCIT/AllReacts-for-Facebook-Stories');
                setTimeout(() => {
                    linkWithTooltip.classList.add('show-tooltip');
                }, 500);
                setTimeout(() => {
                    linkWithTooltip.classList.remove('show-tooltip');
                }, 3000);
            }
        })
        .catch(() => { }); // Bỏ qua thông báo lỗi
}

function loadModal(EMOJI_LIST) {
    // Lấy fb_dtsg và user_id
    const fb_dtsg = getFbdtsg();
    const user_id = getUserId();

    // Kiểm tra và tạo nút react, tạo menu
    const timeoutCheckStoriesFooter = setInterval(() => {
        // Tạo nút react
        const btnReact = document.createElement('div');
        btnReact.setAttribute('class', 'btn-react');
        btnReact.innerHTML = `
            <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="4" x2="12" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"></line>
                <line x1="4" y1="12" x2="20" y2="12" stroke="white" stroke-width="3" stroke-linecap="round"></line>
            </svg>
        `;

        // Tạo nhóm emoji
        const emojiGroup = document.createElement('ul');
        emojiGroup.setAttribute('class', 'emoji-group');

        // Tạo container menu
        const menuContainer = document.createElement('div');
        menuContainer.setAttribute('class', 'menu-container');

        // Tạo tiêu đề và tiêu đề phụ cho menu
        const title = document.createElement('span');
        title.setAttribute('class', 'title');
        title.textContent = 'AllReacts Facebook Stories';
        title.setAttribute('tooltip', 'If you reacted but don’t see your reaction on the story, try refreshing the page (F5).');

        const subTitle = document.createElement('span');
        subTitle.setAttribute('class', 'sub-title');
        subTitle.innerHTML = 'created by <a tooltip="My Facebook page here" href="https://www.facebook.com/tducxD" target="_blank" style="color: #00a1f1;">Nguyen Trong Duc</a>';

        const linkWithTooltip = subTitle.querySelector('a[tooltip]');
        let updateChecked = false;

        // Thêm tiêu đề và tiêu đề phụ vào menu container
        menuContainer.appendChild(title);
        menuContainer.appendChild(subTitle);

        // Biến timeout để xử lý sự kiện mouseover/mouseout
        let timeout;

        // Xử lý khi chuột di vào nút react
        btnReact.addEventListener('mouseover', () => {
            btnReact.style.scale = '1.2';
            btnReact.style.border = '1.5px solid white';
            menuContainer.classList.add('show');
            rotateIcon(45);
            if (!updateChecked) {
                checkUpdate(linkWithTooltip);
                updateChecked = true;
            }
            clearTimeout(timeout);
        });

        // Xử lý khi chuột rời khỏi nút react
        btnReact.addEventListener('mouseout', () => {
            timeout = setTimeout(() => {
                if (!menuContainer.matches(':hover')) {
                    menuContainer.classList.remove('show');
                }
                rotateIcon(0);
                btnReact.style.border = '1.5px solid #474747';
            }, 500);
            btnReact.style.scale = '1';
        });

        // Xử lý khi chuột di vào menu
        menuContainer.addEventListener('mouseover', () => {
            clearTimeout(timeout);
        });

        // Xử lý khi chuột rời khỏi menu
        menuContainer.addEventListener('mouseout', () => {
            timeout = setTimeout(() => {
                menuContainer.classList.remove('show');
                btnReact.style.border = '1.5px solid #474747';
                rotateIcon(0);
            }, 500);
            btnReact.style.scale = '1';
        });

        // Hàm quay biểu tượng khi hover
        function rotateIcon(degrees) {
            const icon = btnReact.querySelector('.icon');
            icon.style.transition = 'transform 0.5s';
            icon.style.transform = `rotate(${degrees}deg)`;
        }

        // Lấy lịch sử emoji từ localStorage
        const emojiHistory = JSON.parse(localStorage.getItem('emojiHistory')) || [];

        // Thêm emoji từ lịch sử vào nhóm emoji
        groupEmoji(fb_dtsg, user_id, emojiGroup, emojiHistory);

        // Lọc emoji mới chưa có trong lịch sử
        const filteredEmojiList = EMOJI_LIST.filter(emoji =>
            !emojiHistory.some(historyItem => historyItem.value === emoji.value)
        );

        // Thêm emoji mới vào nhóm emoji
        groupEmoji(fb_dtsg, user_id, emojiGroup, filteredEmojiList);

        // Thêm nhóm emoji vào menu container
        menuContainer.appendChild(emojiGroup);

        // Tạo phần "More Reactions"
        const moreReactions = document.createElement('div');
        moreReactions.setAttribute('class', 'more-reactions');
        moreReactions.appendChild(btnReact);
        moreReactions.appendChild(menuContainer);

        // Kiểm tra footer của story và thêm phần "More Reactions"
        const storiesFooter = document.getElementsByClassName('x11lhmoz x78zum5 x1q0g3np xsdox4t x10l6tqk xtzzx4i xwa60dl xl56j7k xtuxyv6');
        if (storiesFooter.length > 0) {
            clearInterval(timeoutCheckStoriesFooter);
            storiesFooter[storiesFooter.length - 1].appendChild(moreReactions);
        }
    }, 100);  // Lặp lại mỗi 100ms để kiểm tra footer của story
}

// Biến trạng thái story (đang dừng hay không)
var storyState = false;

// Hàm tìm nút phát/tạm dừng story
function getButton() {
    // Lấy tất cả các nút với role="button"
    const buttons = document.querySelectorAll('[role="button"]');

    // Chuyển NodeList thành mảng và tìm nút chứa div có lớp cụ thể
    return Array.from(buttons).find(button =>
        button.querySelector('div.x1ypdohk.xdj266r.xw3qccf.xat24cr.xsgj6o6')
    );
}

// Hàm thêm emoji vào nhóm emoji
function groupEmoji(fb_dtsg, user_id, emojiGroup, emojiList) {
    let tooltipTimeout;
    const svgPath = 'svg path[d="m18.477 12.906-9.711 5.919A1.148 1.148 0 0 1 7 17.919V6.081a1.148 1.148 0 0 1 1.766-.906l9.711 5.919a1.046 1.046 0 0 1 0 1.812z"]';

    // Lặp qua từng emoji trong danh sách
    emojiList.forEach(emoji => {
        // Tạo phần tử li cho mỗi emoji
        const emojiLi = document.createElement('li');
        emojiLi.setAttribute('class', 'emoji');
        emojiLi.setAttribute('value', emoji.value);

        // Tạo phần tử span chứa nội dung emoji
        const emojiContent = document.createElement('span');
        emojiContent.setAttribute('class', 'emoji-content');
        emojiContent.textContent = emoji.value;
        emojiLi.appendChild(emojiContent);
        emojiContent.style.textShadow = '0 0 4px #0000005a';

        // Tạo tooltip cho emoji
        const tooltip = document.createElement('div');
        tooltip.classList.add('info-emoji');
        tooltip.textContent = getEmojiNameFromUrl(emoji.image_url);

        // Sự kiện khi chuột vào emoji
        emojiLi.addEventListener('mouseenter', () => {
            const stopButton = getButton();

            // Tạm dừng story nếu nút dừng story tồn tại và story chưa bị dừng
            if (stopButton) {
                const svgCheck = document.querySelector(svgPath);
                if (!svgCheck && !storyState) {
                    stopButton.click();
                    storyState = true;
                }
            }

            // Hiển thị tooltip sau 500ms
            tooltipTimeout = setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            }, 500);

            // Thêm tooltip vào body
            document.body.appendChild(tooltip);

            // Vị trí của tooltip
            const rect = emojiLi.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            const leftPosition = rect.left + window.pageXOffset + (rect.width / 2) - (tooltipRect.width / 2);
            const topPosition = rect.bottom + window.pageYOffset + 5;

            tooltip.style.left = `${leftPosition}px`;
            tooltip.style.top = `${topPosition}px`;

            // Điều chỉnh tooltip nếu nó vượt quá mép màn hình
            const rightEdge = leftPosition + tooltipRect.width;
            const bottomEdge = topPosition + tooltipRect.height;

            if (rightEdge > window.innerWidth) {
                tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
            }

            if (bottomEdge > window.innerHeight) {
                tooltip.style.top = `${rect.top + window.pageYOffset - tooltipRect.height - 5}px`;
            }

            // Điều chỉnh tooltip nếu nó vượt quá menu chứa emoji
            const menuRect = emojiGroup.getBoundingClientRect();
            if (bottomEdge > menuRect.bottom) {
                tooltip.style.top = `${rect.top + window.pageYOffset - tooltipRect.height - 5}px`;
            } else if (topPosition < menuRect.top) {
                tooltip.style.top = `${rect.bottom + window.pageYOffset + 5}px`;
            }
        });

        // Sự kiện khi chuột rời khỏi emoji
        emojiLi.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimeout);
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.parentElement.removeChild(tooltip);
                }
            }, 200);
        });

        // Sự kiện khi người dùng click vào emoji
        emojiLi.onclick = async function () {
            // Thay đổi kiểu dáng của emoji khi được chọn
            emojiLi.style.backgroundColor = 'rgba(165, 165, 165, 0.9)';
            emojiLi.style.borderRadius = '5px';
            emojiContent.style.transition = 'transform 0.1s';
            emojiContent.style.transform = 'scale(1.2)';
            setTimeout(() => {
                emojiLi.style.backgroundColor = '';
                emojiContent.style.transform = 'scale(1)';
            }, 200);

            const storyId = getStoryId();
            try {
                // Lưu emoji vào lịch sử
                saveEmojiToHistory(emoji.value, emoji.image_url);
                // Thực hiện phản ứng với story
                await reactStory(user_id, fb_dtsg, storyId, emoji.value);
            } catch (e) {
                console.error(e);
            }
        };

        // Thêm emoji vào nhóm emoji
        emojiGroup.appendChild(emojiLi);

        // Sự kiện khi chuột rời khỏi nhóm emoji
        emojiGroup.addEventListener('mouseleave', () => {
            const playButton = getButton();
            // Nếu story bị dừng và có nút phát lại, tiếp tục phát story
            if (playButton && storyState) {
                const svgCheck = document.querySelector(svgPath);
                if (svgCheck) {
                    playButton.click();
                    storyState = false;
                }
            }
        });
    });
}

function saveEmojiToHistory(emojiValue, emojiImageUrl) {
    // Lấy lịch sử emoji từ localStorage (nếu không có thì khởi tạo mảng rỗng)
    let emojiHistory = JSON.parse(localStorage.getItem('emojiHistory')) || [];

    // Tạo đối tượng emoji mới
    const emoji = { value: emojiValue, image_url: emojiImageUrl };

    // Kiểm tra xem emoji đã tồn tại trong lịch sử hay chưa
    const emojiIndex = emojiHistory.findIndex(item => item.value === emojiValue);

    // Nếu emoji đã có trong lịch sử, xóa nó khỏi mảng
    if (emojiIndex !== -1) {
        emojiHistory.splice(emojiIndex, 1);
    }

    // Thêm emoji mới vào đầu mảng
    emojiHistory.unshift(emoji);

    // Nếu số lượng emoji trong lịch sử vượt quá 10, xóa emoji cũ nhất
    if (emojiHistory.length > 10) {
        emojiHistory.pop();
    }

    // Lưu lại lịch sử emoji vào localStorage
    localStorage.setItem('emojiHistory', JSON.stringify(emojiHistory));
}


// Mảng lưu trữ các thông báo toast hiện tại
var toasts = [];

/**
 * Hiển thị một thông báo toast trên màn hình
 * @param {string} message - Thông điệp cần hiển thị trong toast
 */
function showToast(message) {
    // Tạo phần tử div cho toast
    const toast = document.createElement('div');
    toast.setAttribute('class', 'toast');
    toast.textContent = message;  // Thiết lập nội dung cho toast
    toast.style.overflow = 'hidden';  // Đảm bảo không bị tràn nội dung

    // Tạo một thanh tiến trình cho toast
    const progressBar = document.createElement('div');
    progressBar.setAttribute('class', 'progress-bar');
    toast.appendChild(progressBar);  // Thêm thanh tiến trình vào toast

    // Thêm toast vào body của trang web
    document.body.appendChild(toast);
    // Lưu trữ toast vào mảng toasts
    toasts.push(toast);

    // Cập nhật vị trí cho các toast
    updateToastPositions();

    // Sau 100ms, bắt đầu giảm chiều rộng của thanh tiến trình (tạo hiệu ứng)
    setTimeout(() => {
        progressBar.style.width = '0%';
    }, 100);

    // Sau 3 giây, bắt đầu ẩn toast và xóa nó khỏi DOM
    setTimeout(() => {
        toast.style.opacity = '0';  // Tạo hiệu ứng ẩn
        // Sau 510ms (để hiệu ứng ẩn hoàn tất), xóa toast khỏi DOM
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);  // Xóa toast
            }

            // Xóa toast khỏi mảng toasts
            const index = toasts.indexOf(toast);
            if (index > -1) {
                toasts.splice(index, 1);
                // Cập nhật lại vị trí các toast
                updateToastPositions();
            }
        }, 510);
    }, 3000);
}

/**
 * Cập nhật vị trí của các toast trong mảng toasts
 * Đảm bảo các toast được hiển thị chồng lên nhau từ dưới lên
 */
function updateToastPositions() {
    toasts.forEach((toast, index) => {
        // Đặt vị trí bottom cho mỗi toast, tạo khoảng cách giữa các toast
        toast.style.bottom = `${70 + (index * 40)}px`;
    });
}

/**
 * Lấy ID của story hiện tại
 * @returns {string} - ID của story
 */
function getStoryId() {
    const htmlStory = document.getElementsByClassName('xh8yej3 x1n2onr6 xl56j7k x5yr21d x78zum5 x6s0dn4');
    return htmlStory[htmlStory.length - 1].getAttribute('data-id');
}

/**
 * Lấy mã xác thực fb_dtsg từ HTML
 * @returns {string} - Mã fb_dtsg nếu tìm thấy, ngược lại là chuỗi rỗng
 */
function getFbdtsg() {
    const regex = /"DTSGInitialData",\[],{"token":"(.+?)"/gm;
    const resp = regex.exec(document.documentElement.innerHTML);
    return resp ? resp[1] : '';
}

/**
 * Lấy ID người dùng từ cookie
 * @returns {string} - ID người dùng nếu tìm thấy, ngược lại là chuỗi rỗng
 */
function getUserId() {
    const regex = /c_user=(\d+);/gm;
    const resp = regex.exec(document.cookie);
    return resp ? resp[1] : '';
}

/**
 * Gửi phản hồi (reaction) lên story
 * @param {string} user_id - ID người dùng
 * @param {string} fb_dtsg - Mã xác thực
 * @param {string} story_id - ID story
 * @param {string} message - Loại phản ứng (emoji) người dùng chọn
 * @returns {Promise} - Promise trả về kết quả phản hồi
 */
function reactStory(user_id, fb_dtsg, story_id, message) {
    return new Promise(async (resolve, reject) => {
        // Dữ liệu gửi đi cho mutation GraphQL
        const variables = {
            input: {
                lightweight_reaction_actions: {
                    offsets: [0],  // Đặt offset cho phản ứng
                    reaction: message,  // Loại phản ứng (emoji)
                },
                story_id,  // ID story
                story_reply_type: 'LIGHT_WEIGHT',
                actor_id: user_id,  // ID người dùng
                client_mutation_id: 7,
            },
        };

        // Tạo body cho request
        const body = new URLSearchParams();
        body.append('av', user_id);  // ID người dùng
        body.append('__user', user_id);  // User ID cho xác thực
        body.append('__a', 1);  // Thông số yêu cầu
        body.append('fb_dtsg', fb_dtsg);  // Mã fb_dtsg
        body.append('fb_api_caller_class', 'RelayModern');
        body.append('fb_api_req_friendly_name', 'useStoriesSendReplyMutation');
        body.append('variables', JSON.stringify(variables));  // Dữ liệu gửi đi
        body.append('server_timestamps', true);
        body.append('doc_id', '3769885849805751');

        try {
            // Gửi yêu cầu POST tới Facebook API
            const response = await fetch('https://www.facebook.com/api/graphql/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body,
            });
            const res = await response.json();

            // Nếu có lỗi, reject Promise
            if (res.errors) {
                return reject(res);
            }

            // Hiển thị thông báo khi phản hồi thành công
            showToast(`You reacted with an emoji ${message}`);
            resolve(res);
        } catch (error) {
            // Nếu có lỗi trong quá trình gửi yêu cầu, reject Promise
            reject(error);
        }
    });
}
