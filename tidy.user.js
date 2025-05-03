// ==UserScript==
// @name         Chasm tidy (캐즘 타이디) v1.2
// @namespace    https://github.com/chasm-js
// @version      1.2
// @description  팔로잉 및 좋아요 제외 메인 지워버리기, 설정 및 스위치 기능 추가
// @author       chasm-js
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @updateURL    https://raw.githubusercontent.com/chasm-js/snack/refs/heads/main/tidy.user.js
// @grant        none
// ==/UserScript==

(function(){function g(){const a=localStorage.getItem("chasmTidy");return a?JSON.parse(a):h}function f(a){document.querySelectorAll(".css-19je3cw.edj5hvk0").forEach(c=>{c.style.display=a?"none":""});const b=g();document.querySelectorAll("#home-page .css-1xdtme2 > .css-1e9b5q2, #home-page .css-1xdtme2 > .css-1fa2zrr").forEach(c=>{const d=c.querySelector("p.css-1ctc6vx")?.textContent||"",e=b.some(m=>d.includes(m));c.style.display=a&&!e?"none":""})}function n(){var a=g();a=prompt("\ub0a8\uae30\uace0 \uc2f6\uc740 \uc139\uc158\uc758 \uc81c\ubaa9\uc5d0 \ud3ec\ud568\ub41c \ud0a4\uc6cc\ub4dc\ub97c \ucf64\ub9c8(,) \ub85c \uad6c\ubd84\ud558\uc5ec \uc785\ub825\ud558\uc138\uc694. \ud574\ub2f9\ud558\ub294 \ud0a4\uc6cc\ub4dc\uac00 \uc5c6\ub294 \uc139\uc158\uc740 \uc228\uaca8\uc9d1\ub2c8\ub2e4. \uc608\uc2dc: \ud314\ub85c\uc6b0,\ucd94\ucc9c,\ub728\uac70\uc6b4,\uc2e0\uc608,\ub7ad\ud0b9,\ub458\ub7ec\ubcf4\uae30,\uc88b\uc544\uc694",
a.join(", "));a!==null&&(a=a.split(",").map(b=>b.trim()).filter(b=>b),localStorage.setItem("chasmTidy",JSON.stringify(a.length?a:h)),document.getElementById("chasm-tidy-switch").checked&&f(!0))}function k(){return document.body.getAttribute("data-theme")==="dark"}function l(){const a=document.querySelector(".css-19je3cw.edj5hvk0");if(a&&!document.getElementById("chasm-tidy-container")){var b=document.createElement("div");b.id="chasm-tidy-container";b.style.cssText="display: flex; justify-content: flex-end; align-items: center; width: 100%; padding: 10px; box-sizing: border-box; gap: 10px;";
var c=document.createElement("label");c.textContent="\ud0c0\uc774\ub514 \uc801\uc6a9 ";c.style.cssText=`
            display: flex;
            align-items: center;
            gap: 5px;
            ${k()?"color: #b0b0b0;":"color: #333;"}
        `;var d=document.createElement("input");d.id="chasm-tidy-switch";d.type="checkbox";d.checked=!0;d.style.cssText="cursor: pointer;";d.addEventListener("change",()=>{f(d.checked)});c.appendChild(d);var e=document.createElement("button");e.textContent="\u2699\ufe0f";e.style.cssText=`
            padding: 5px 10px;
            background: transparent;
            ${k()?"color: #b0b0b0;":"color: #333;"}
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 16px;
        `;e.addEventListener("click",n);b.appendChild(c);b.appendChild(e);a.parentNode.insertBefore(b,a.nextSibling);f(!0)}}const h=["\ud314\ub85c\uc6b0","\uc88b\uc544\uc694"];(new MutationObserver(()=>{l();document.getElementById("chasm-tidy-switch")?.checked&&f(!0)})).observe(document.body,{childList:!0,subtree:!0});window.addEventListener("load",()=>{l();f(!0)})})();
