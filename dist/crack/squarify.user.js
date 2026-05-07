// ==UserScript==
// @name         Chasm Crystallized Squarify (결정화 캐즘 제곱근)
// @namespace    https://github.com/milkyway0308
// @version      CRCK-SQAR-v1.0.0
// @author       milkyway0308
// @description  세션 목록 이미지 직사각형으로 조정. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/dist/crack/squarify.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/dist/crack/squarify.user.js
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// ==/UserScript==

(function () {
    'use strict';

    class d extends Error{constructor(){super();}}class f{constructor(t){this.runner=t;}runner;lastTaskId=null;runDebouncer(t){this.lastTaskId&&clearTimeout(this.lastTaskId),this.lastTaskId=setTimeout(this.runner,t);}}class h{constructor(t,s,r){this.minDelay=t,this.maxDelay=s,this.task=r,this.currentDelay=t;}minDelay;maxDelay;task;currentDelay;lastTaskId=null;started=false;start(){this.started||(this.started=true,this.schedule());}stop(){this.started=false,this.lastTaskId&&clearTimeout(this.lastTaskId);}async schedule(){if(this.started)try{await this.task(),this.currentDelay=this.minDelay;}catch(t){this.currentDelay=Math.min(this.maxDelay,this.currentDelay*2),t instanceof d||console.error(t);}finally{this.started&&(this.lastTaskId=setTimeout(()=>this.schedule(),this.currentDelay));}}}function y(e){return new f(e)}function m(e,t,s){return new h(e,t,s)}const b={debouncer:y,backoff:m};class a{static init(t){typeof document<"u"&&t();}static onPagePrepare(t){let s=false;const r=()=>{s||(s=true,t());};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r(),window.addEventListener("load",r);}static callGMAddStyle(t){return typeof GM_addStyle<"u"?(GM_addStyle(t),true):false}static callGMGetResourceUrl(t){if(typeof GM_getResourceURL<"u")return GM_getResourceURL(t)}}function v(e,t){return e?e.querySelector(t):null}function D(e,t){return e?Array.from(e.querySelectorAll(t)):[]}function c(e){return document.querySelector(e)}function l(e){return Array.from(document.querySelectorAll(e))}function w(e,t,s){const r=c(e);return t?r?s(r):null:s(r)}function k(e,t,s){const r=l(e);return t?r.length>0?s(r):null:s(r)}const n={get:c,getAll:l,on:w,onAll:k,by:v,byAll:D};class u{static attachObserver(t,s){const r=window.MutationObserver||window.WebKitMutationObserver;t&&r&&new r(s).observe(t,{childList:true,subtree:true,attributes:true});}static attachHrefObserver(t,s){let r=location.href;this.attachObserver(t,()=>{r!==location.href&&(r=location.href,s());});}static onPageReady(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t(),window.addEventListener("load",t);}static attachResizeObserver(t,s){const r=new ResizeObserver(s);return r.observe(t),()=>{r.unobserve(t);}}}const i=new WeakSet;function o(){const e=n.get('[data-testid="virtuoso-scroller"]');e&&(i.has(e)||(i.add(e),u.attachObserver(e,()=>{for(const t of n.byAll(e,"img"))t.hasAttribute("chasm-sqar-modified")||(t.setAttribute("chasm-sqar-modified","true"),t.parentElement?.classList.add("chasm-sqar-squarify"));})));}a.init(()=>{o();const e=b.debouncer(o);u.attachObserver(document,()=>e.runDebouncer(50)),a.callGMAddStyle(`
        .chasm-sqar-squarify {
            width: 36px !important;
            height: 54px !important;
            border-radius: 0px !important;
        }        
    `);});

})();