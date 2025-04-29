// ==UserScript==
// @name         Chasm tidy (캐즘 타이디)
// @namespace    https://github.com/chasm-js
// @version      1.0
// @description  팔로잉 및 좋아요 제외 메인 지워버리기
// @author       chasm-js
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @updateURL    https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hideElements() {
        // 1. .css-19je3cw.edj5hvk0 클래스 숨기기
        document.querySelectorAll('.css-19je3cw.edj5hvk0').forEach(el => {
            el.style.display = 'none';
        });

        // 2. .css-1xdtme2.edj5hvk0 > .css-1fa2zrr.edj5hvk0 중 마지막 2개 제외하고 숨기기
        document.querySelectorAll('.css-1xdtme2.edj5hvk0').forEach(parent => {
            const children = Array.from(parent.querySelectorAll(':scope > .edj5hvk0'));
            const toHide = children.slice(0, -3); // 마지막 2개 제외
            toHide.forEach(el => {
                el.style.display = 'none';
            });
        });
    }

    // 페이지 로딩 이후 및 변화 감지
    const observer = new MutationObserver(hideElements);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', hideElements);
})();
