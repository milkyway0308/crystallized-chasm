// ==UserScript==
// @name         Chasm tidy (캐즘 타이디) v1.1
// @namespace    https://github.com/chasm-js
// @version      1.1
// @description  팔로잉 및 좋아요 제외 메인 지워버리기
// @author       chasm-js
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @updateURL    https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function hideElements() {
        // 1. .css-19je3cw.edj5hvk0 클래스 숨기기
        document.querySelectorAll('.css-19je3cw.edj5hvk0').forEach(el => {
            el.style.display = 'none';
        });

        // 2. #home-page .css-1xdtme2 > .edj5hvk0 중 특정 텍스트 포함 안된 것 숨기기
        document.querySelectorAll('#home-page .css-1xdtme2 > .css-1e9b5q2, #home-page .css-1xdtme2 > .css-1fa2zrr').forEach(el => {
            const textContainer = el.querySelector('p.css-1ctc6vx');
            const text = textContainer?.textContent || '';
            if (!text.includes('팔로우') && !text.includes('좋아요')) {
                el.style.display = 'none';
            }
        });
    }

    // DOM 변화 감지 및 초기 실행
    const observer = new MutationObserver(hideElements);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', hideElements);
})();
