// ==UserScript==
// @name         Chasm Crystallized Optout (결정화 캐즘 수신거부)
// @namespace    https://github.com/milkyway0308
// @version      CRCK-OOUT-v1.0.0
// @author       milkyway0308
// @description  크랙 스토리 업데이트 권유 배너 삭제. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/dist/crack/optout.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/dist/crack/optout.user.js
// @match        https://crack.wrtn.ai/builder/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
	'use strict';

	class i extends Error{constructor(){super();}}class l{constructor(t){this.runner=t;}runner;lastTaskId=null;runDebouncer(t){this.lastTaskId&&clearTimeout(this.lastTaskId),this.lastTaskId=setTimeout(this.runner,t);}}class o{constructor(t,n,r){this.minDelay=t,this.maxDelay=n,this.task=r,this.currentDelay=t;}minDelay;maxDelay;task;currentDelay;lastTaskId=null;started=false;start(){this.started||(this.started=true,this.schedule());}stop(){this.started=false,this.lastTaskId&&clearTimeout(this.lastTaskId);}async schedule(){if(this.started)try{await this.task(),this.currentDelay=this.minDelay;}catch(t){this.currentDelay=Math.min(this.maxDelay,this.currentDelay*2),t instanceof i||console.error(t);}finally{this.started&&(this.lastTaskId=setTimeout(()=>this.schedule(),this.currentDelay));}}}function c(e){return new l(e)}function u(e,t,n){return new o(e,t,n)}const d={debouncer:c,backoff:u};class f{static init(t){typeof document<"u"&&t();}static onPagePrepare(t){let n=false;const r=()=>{n||(n=true,t());};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r(),window.addEventListener("load",r);}static callGMAddStyle(t){return typeof GM_addStyle<"u"?(GM_addStyle(t),true):false}}function h(e,t){return e?e.querySelector(t):null}function y(e,t){return e?Array.from(e.querySelectorAll(t)):[]}function s(e){return document.querySelector(e)}function a(e){return Array.from(document.querySelectorAll(e))}function b(e,t,n){const r=s(e);return t?r?n(r):null:n(r)}function m(e,t,n){const r=a(e);return t?r.length>0?n(r):null:n(r)}const v={get:s,getAll:a,on:b,onAll:m,by:h,byAll:y};class D{static attachObserver(t,n){const r=window.MutationObserver||window.WebKitMutationObserver;t&&r&&new r(n).observe(t,{childList:true,subtree:true,attributes:true});}static attachHrefObserver(t,n){let r=location.href;this.attachObserver(t,()=>{r!==location.href&&(r=location.href,n());});}static onPageReady(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t(),window.addEventListener("load",t);}static attachResizeObserver(t,n){const r=new ResizeObserver(n);return r.observe(t),()=>{r.unobserve(t);}}}f.init(()=>{const e=d.debouncer(()=>{const t=v.getAll("button").filter(n=>n.textContent==="업데이트 하기");t.length>0&&t[0].parentElement?.remove();});D.attachObserver(document,()=>e.runDebouncer(50));});

})();