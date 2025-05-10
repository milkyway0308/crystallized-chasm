// ==UserScript==
// @name         Chasm style (캐즘 스타일) v1.0
// @namespace    https://github.com/chasm-js
// @version      1.0
// @description  iOS 환경 자동 확대 / Firefox 환경 코드블록 폰트 강제 일반폰트화
// @author       chasm-js
// @updateURL    https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/style.user.js
// @updateURL    https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/style.user.js
// @match        https://crack.wrtn.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1) iOS 줌 방어를 위한 viewport 메타 강제 설정
    const setViewport = () => {
        let vp = document.querySelector('meta[name="viewport"]');
        if (!vp) {
            vp = document.createElement('meta');
            vp.name = 'viewport';
            document.head.appendChild(vp);
        }
        vp.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        vp.setAttribute('data-force', 'true');
    };

    // 초기 적용
    setViewport();

    // 동적 로드에도 적용되도록 관찰
    new MutationObserver(setViewport)
        .observe(document.documentElement, { childList: true, subtree: true });

    // 2) .message-item code 및 하위 태그에 폰트 패밀리 강제 적용
    const styleId = 'chasm-style-font-family';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .message-item code,
            .message-item code * {
                font-family: Pretendard, sans-serif !important;
            }
        `;
        // body 마지막 직전에 삽입
        document.body.insertBefore(style, document.body.lastChild);
    }
})();
