(function () {
    'use strict';

    // Can thiệp vào các yêu cầu fetch API để chặn các yêu cầu cụ thể
    const originalFetch = window.fetch;
    window.fetch = function (resource, config) {
        const requestURL = (resource instanceof Request) ? resource.url : resource;

        // Nếu body của yêu cầu chứa 'storiesUpdateSeenStateMutation', thì chặn yêu cầu đó
        if (config && config.body && typeof config.body === 'string' && config.body.includes('storiesUpdateSeenStateMutation')) {
            console.log('Blocked'); // Ghi lại thông báo yêu cầu đã bị chặn
            return new Promise(() => { }); // Chặn yêu cầu bằng cách không bao giờ giải quyết promise
        }

        // Nếu yêu cầu không bị chặn, tiếp tục với yêu cầu fetch gốc
        return originalFetch.apply(this, arguments);
    };

    // Can thiệp vào XMLHttpRequest để lưu lại thông tin yêu cầu
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method; // Lưu trữ phương thức HTTP của yêu cầu
        this._url = url; // Lưu trữ URL của yêu cầu
        originalOpen.apply(this, arguments); // Tiếp tục với phương thức open gốc
    };

    const originalSend = XMLHttpRequest.prototype.send;

    // Sử dụng defineProperty để ghi đè phương thức send của XMLHttpRequest một cách an toàn
    Object.defineProperty(XMLHttpRequest.prototype, 'send', {
        configurable: true, // Cho phép cấu hình lại phương thức send
        enumerable: true, // Cho phép phương thức send có thể liệt kê
        writable: true, // Cho phép sửa đổi phương thức send
        value: function (body) {
            // Nếu URL yêu cầu chứa 'graphql' và body của yêu cầu có chứa 'storiesUpdateSeenStateMutation', chặn yêu cầu đó
            if (this._url.includes('graphql') && typeof body === 'string' && body.includes('storiesUpdateSeenStateMutation')) {
                console.log('Blocked'); // Ghi lại thông báo yêu cầu đã bị chặn
                this.abort(); // Hủy yêu cầu để chặn nó
            } else {
                // Nếu yêu cầu không bị chặn, tiếp tục với phương thức send gốc
                originalSend.apply(this, arguments);
            }
        }
    });

})();
