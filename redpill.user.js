// ==UserScript==
// @name        Chasm Crystallized RedPill (결정화 캐즘 붉은약)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-PILL-v1.3.1
// @description 크랙의 통계 수정 및 데이터 표시 개선. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      chasm-js, milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/redpill.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/redpill.user.js
// @grant       GM_addStyle
// ==/UserScript==
GM_addStyle(
  'body[data-theme="dark"] .red-pill-realtime-usage { color: #F0EFEB; font-weight: bold; font-size: 12px;}' +
    'body[data-theme="light"] .red-pill-realtime-usage {color: #1A1918; font-weight: bold; font-size: 12px;}' + 
    '.red-pill-refresh-button { padding: 0px 12px; border: 1px solid var(--text_disabled); height: 28px; color: var(--text_primary); font-size: 14px; margin-right: 5px; border-radius: 4px; }'
);
(function () {
  let isIntegrationMode = false;
  /**
   * 쿠키에서 액세스 토큰을 추출해 반환합니다.
   * @returns 액세스 토큰
   */
  function extractAccessToken() {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === "access_token") return value;
    }
    return null;
  }
  /**
   * 지정된 로그 요소의 맨 윗 부분에 로그를 덧붙이고, 맨 위로 스크롤합니다.
   * @param {Node} logElement 로그 요소. TextArea, 혹은 span을 사용합니다.
   * @param {string} message 덧붙일 로그 메시지
   */
  function appendLog(logElement, message) {
    const time = new Date().toLocaleString();
    logElement.value = `[${time}]\n${message}\n\n${logElement.value}`;
    logElement.scrollTop = 0;
  }
  function extractUsageQuantity(json) {
    // If [json.quantity] exists, it is legacy format - keep it for compatibility
    if (json.quantity) {
      return json.quantity;
    }
    // If product is cracker, just return value
    if (json.product === "cracker") {
      return json.balance.total;
    }
    // If product is superchat, it's legacy log - multiply 35
    if (json.product === "superchat") {
      return json.balance.total * 35;
    }
    // If none matched, it's unknown at this moment - just return value
    return json.balance.total;
  }
  function appendPageLog(c, d) {
    const h = c.value.split("\n"),
      f = h.findIndex(
        (a) =>
          a.includes("\uc0ac\uc6a9\ub0b4\uc5ed") &&
          a.match(/\ud398\uc774\uc9c0 \ub85c\ub4dc\ub428$/)
      );
    f >= 0 && (h.splice(f - 1, 3), (c.value = h.join("\n")));
    appendLog(
      c,
      `\uc0ac\uc6a9\ub0b4\uc5ed ${d} \ud398\uc774\uc9c0 \ub85c\ub4dc\ub428`
    );
  }
  function Q(c, d) {
    c = d - c;
    d = Math.floor((c % 6e4) / 1e3);
    return `${String(Math.floor(c / 6e4)).padStart(2, "0")}\ubd84 ${String(
      d
    ).padStart(2, "0")}\ucd08`;
  }
  function H(c, d, h, f, a, u = 0, p = [], y = {}) {
    var k = f.filter((b) => {
        b = b.date.slice(0, 7);
        return y[b] !== !1;
      }),
      r = p.filter((b) => {
        b = b.paymentDate.slice(0, 7);
        return y[b] !== !1;
      }).length;
    const v = k
        .filter((b) => b.isConsumed)
        .reduce((b, n) => b + extractUsageQuantity(n), 0),
      z = k
        .filter((b) => !b.isConsumed)
        .reduce((b, n) => b + extractUsageQuantity(n), 0),
      D = k
        .filter((b) => b.isConsumed && b.consumedType === "unlimited")
        .reduce((b, n) => b + extractUsageQuantity(n), 0),
      e =
        k.length > 0
          ? k
              .sort((b, n) => new Date(n.date) - new Date(b.date))[0]
              .date.slice(0, 10)
          : "N/A";
    c.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div><strong>\ucd1d \uc0ac\uc6a9\ub7c9:</strong> <span style="font-family: monospace;">${v}</span></div>
                    <div><strong>\ucd1d \ud68d\ub4dd\ub7c9:</strong> <span style="font-family: monospace;">${z}</span></div>
                    <div><strong>\ub9c8\uc9c0\ub9c9 \ub0b4\uc5ed \ub0a0\uc9dc:</strong> <span style="font-family: monospace;">${e}</span></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div><strong>\ubb34\uc81c\ud55c \uc0ac\uc6a9 \ucd1d\ub7c9:</strong> <span style="font-family: monospace;">${D}</span></div>
                    <div><strong>\uacb0\uc81c \ud69f\uc218:</strong> <span style="font-family: monospace;">${r}</span></div>
                    <div><strong>\ud3c9\uade0 \uc0ac\uc6a9\ub7c9:</strong> <span style="font-family: monospace;">${
                      r > 0 ? Math.round(D / r) : 0
                    }</span></div>
                </div>
            </div>
        `;
    const g = {};
    f.forEach((b) => {
      var n = new Date(b.date);
      const t = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      n = String(n.getDate()).padStart(2, "0");
      g[t] ||
        (g[t] = {
          consumption: {},
          acquisition: {},
          totalConsumption: 0,
          totalAcquisition: 0,
        });
      const q = b.isConsumed ? "consumption" : "acquisition";
      let quantity = b.quantity
        ? b.quantity
        : b.product === "cracker"
        ? b.balance.total
        : b.balance.total * 35;
      g[t][q][n] = (g[t][q][n] || 0) + quantity;
      g[t][b.isConsumed ? "totalConsumption" : "totalAcquisition"] += quantity;
    });
    r = `
            <style>
                details > summary .toggle-text::after {
                    content: '(\ub354\ubcf4\uae30)';
                    opacity: 0.5;
                    font-size: 0.8rem;
                }
                details[open] > summary .toggle-text::after {
                    content: '(\ub2eb\uae30)';
                    opacity: 0.5;
                    font-size: 0.8rem;
                }
            </style>
            <div style="display: flex; flex-direction: column; gap: 5px; color: ${
              a ? "#ddd" : "#333"
            };">
        `;
    for (const [b, n] of Object.entries(g).sort().reverse())
      r += `
                <details style="border-bottom: 1px solid ${
                  a ? "#444" : "#ccc"
                };">
                    <summary style="display: flex; align-items: center; padding: 5px; cursor: pointer; min-height: 20px; background: ${
                      a ? "#333" : "#f0f0f0"
                    };">
                        <input type="checkbox" class="month-checkbox" data-month="${b}" ${
        y[b] !== !1 ? "checked" : ""
      } style="margin-right: 5px;">
                        <div style="flex: 1;">${b} <span class="toggle-text"></span></div>
                        <div style="width: 100px; text-align: right; font-family: monospace;">+${
                          n.totalAcquisition
                        }</div>
                        <div style="width: 100px; text-align: right; font-family: monospace;">-${
                          n.totalConsumption
                        }</div>
                    </summary>
                    <div style="display: block; padding: 5px; background: ${
                      a ? "#2a2a2a" : "#f9f9f9"
                    }; min-height: 40px;">
                        ${[
                          [1, 10],
                          [11, 20],
                          [21, 31],
                        ]
                          .map(
                            ([t, q]) => `
                            <ul style="display: flex; flex-direction: column; gap: 5px; padding: 5px; margin: 0;">
                                <li style="display: flex; gap: 5px; background: ${
                                  a ? "#444" : "#e0e0e0"
                                }; border-bottom: 1px solid ${
                              a ? "#555" : "#ccc"
                            };">
                                    <div style="width: 60px; font-weight: bold;">\uc77c\uc790</div>
                                    ${Array.from(
                                      { length: q - t + 1 },
                                      (l, B) =>
                                        `<div style="width: 40px; text-align: center;">${
                                          t + B
                                        }</div>`
                                    ).join("")}
                                </li>
                                <li style="display: flex; gap: 5px;">
                                    <div style="width: 60px;">\ud68d\ub4dd\ub7c9</div>
                                    ${Array.from(
                                      { length: q - t + 1 },
                                      (l, B) => {
                                        l = String(t + B).padStart(2, "0");
                                        l = n.acquisition[l] || 0;
                                        return `<div style="width: 40px; text-align: center; font-family: monospace;">${
                                          l > 0 ? "+" + l : ""
                                        }</div>`;
                                      }
                                    ).join("")}
                                </li>
                                <li style="display: flex; gap: 5px;">
                                    <div style="width: 60px;">\uc18c\ubaa8\ub7c9</div>
                                    ${Array.from(
                                      { length: q - t + 1 },
                                      (l, B) => {
                                        l = String(t + B).padStart(2, "0");
                                        l = n.consumption[l] || 0;
                                        return `<div style="width: 40px; text-align: center; font-family: monospace;">${
                                          l > 0 ? "-" + l : ""
                                        }</div>`;
                                      }
                                    ).join("")}
                                </li>
                            </ul>
                        `
                          )
                          .join("")}
                    </div>
                </details>
            `;
    d.innerHTML =
      r +
      `
            </div>
            <div style="margin-top: 10px; opacity: 0.5; font-size: 0.7rem; color: ${
              a ? "#ddd" : "#333"
            };">
                \uccb4\ud06c\ub41c \uc6d4\uc758 \ub0b4\uc5ed\ub9cc\uc73c\ub85c \ub7ad\ud0b9 \ubc0f CSV \ud30c\uc77c\uc774 \uc0dd\uc131\ub429\ub2c8\ub2e4.
            </div>
        `;
    d.querySelectorAll(".month-checkbox").forEach((b) => {
      b.addEventListener("change", () => {
        y[b.dataset.month] = b.checked;
        H(c, d, h, f, a, u, p, y);
      });
    });
    const m = {};
    k.filter((b) => b.isConsumed).forEach((b) => {
      m[b.title] = (m[b.title] || 0) + extractUsageQuantity(b);
    });
    k = Object.entries(m).sort(([, b], [, n]) => n - b);
    let w = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div style="display: flex; background: ${
                  a ? "#333" : "#f0f0f0"
                }; padding: 5px;">
                    <div style="width: 60px; font-weight: bold;">\uc21c\uc704</div>
                    <div style="flex: 1; font-weight: bold;">\uc791\ud488</div>
                    <div style="width: 100px; font-weight: bold; text-align: right;">\uc0ac\uc6a9\ub7c9</div>
                </div>
        `;
    k.forEach(([b, n], t) => {
      w += `
                <div style="display: flex; padding: 5px; border-bottom: 1px solid ${
                  a ? "#444" : "#ccc"
                };">
                    <div style="width: 60px; font-family: monospace;">${
                      t + 1
                    }</div>
                    <div style="flex: 1;">${b}</div>
                    <div style="width: 100px; text-align: right; font-family: monospace;">${n}</div>
                </div>
            `;
    });
    w += "</div>";
    h.innerHTML = w;
  }
  function S(c, d) {
    let h = "Date,Title,IsConsumed,Quantity,ConsumedType\n";
    c.filter((f) => {
      f = f.date.slice(0, 7);
      return d[f] !== !1;
    }).forEach((f) => {
      h +=
        [
          `"${f.date}"`,
          `"${f.title}"`,
          f.isConsumed,
          f.quantity,
          `"${f.consumedType || ""}"`,
        ].join() + "\n";
    });
    return (h = h.trim());
  }
  function T(c, d, h, f) {
    c = c.filter((e) => {
      e = e.date.slice(0, 7);
      return f[e] !== !1;
    });
    h = h.filter((e) => {
      e = e.paymentDate.slice(0, 7);
      return f[e] !== !1;
    }).length;
    let a = "";
    const u = c
        .filter((e) => e.isConsumed)
        .reduce((e, g) => e + extractUsageQuantity(g), 0),
      p = c
        .filter((e) => !e.isConsumed)
        .reduce((e, g) => e + extractUsageQuantity(g), 0),
      y = c
        .filter((e) => e.isConsumed && e.consumedType === "unlimited")
        .reduce((e, g) => e + extractUsageQuantity(g), 0),
      k = h > 0 ? Math.round(y / h) : 0;
    a += '"\uc804\uccb4 \ud1b5\uacc4"\n';
    a += '"\ud56d\ubaa9","\uac12"\n';
    a += `"\ucd1d \uc0ac\uc6a9\ub7c9","${u}"\n`;
    a += `"\ucd1d \ud68d\ub4dd\ub7c9","${p}"\n`;
    a += `"\ud604\uc7ac \ubcf4\uc720\ub7c9","${d}"\n`;
    a += `"\ubb34\uc81c\ud55c \uc0ac\uc6a9 \ucd1d\ub7c9","${y}"\n`;
    a += `"\uacb0\uc81c \ud69f\uc218","${h}"\n`;
    a += `"\ud3c9\uade0 \uc0ac\uc6a9\ub7c9","${k}"\n`;
    const r = {},
      v = {};
    c.forEach((e) => {
      var g = new Date(e.date);
      g = `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, "0")}`;
      const m = e.isConsumed ? r : v;
      m[g] = (m[g] || 0) + extractUsageQuantity(e);
    });
    a += '\n"\uc6d4\ubcc4 \ud1b5\uacc4"\n';
    a += '"\uc6d4","\uc0ac\uc6a9\ub7c9","\ud68d\ub4dd\ub7c9"\n';
    [...new Set([...Object.keys(r), ...Object.keys(v)])]
      .sort()
      .reverse()
      .forEach((e) => {
        a += `"${e}","${r[e] || 0}","${v[e] || 0}"\n`;
      });
    const z = {};
    c.forEach((e) => {
      var g = new Date(e.date);
      const m = `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      g = String(g.getDate()).padStart(2, "0");
      z[m] || (z[m] = { consumption: {}, acquisition: {} });
      const w = e.isConsumed ? "consumption" : "acquisition";
      z[m][w][g] = (z[m][w][g] || 0) + extractUsageQuantity(e);
    });
    for (const [e, g] of Object.entries(z).sort().reverse())
      for (
        a += `\n"\uc77c\ubcc4 \ud1b5\uacc4 - ${e}"\n`,
          a += '"\uc77c\uc790","\uc0ac\uc6a9\ub7c9","\ud68d\ub4dd\ub7c9"\n',
          d = 1;
        d <= 31;
        d++
      )
        (h = String(d).padStart(2, "0")),
          (a += `"${d}","${g.consumption[h] || 0}","${
            g.acquisition[h] || 0
          }"\n`);
    const D = {};
    c.filter((e) => e.isConsumed).forEach((e) => {
      D[e.title] = (D[e.title] || 0) + extractUsageQuantity(e);
    });
    c = Object.entries(D).sort(([, e], [, g]) => g - e);
    a += '\n"\uc791\ud488\ubcc4 \ub7ad\ud0b9"\n';
    a += '"\uc21c\uc704","\uc791\ud488","\uc0ac\uc6a9\ub7c9"\n';
    c.forEach(([e, g], m) => {
      a += `"${m + 1}","${e}","${g}"\n`;
    });
    return (a = a.trim());
  }
  async function U(c, d, h) {
    let f = 5,
      a = !1,
      u;
    for (; f > 0 && !a; )
      try {
        const p = await fetch(
          "https://contents-api.wrtn.ai/superchat/character-super-mode",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${c}`,
              "Content-Type": "application/json",
            },
            signal: h.signal,
          }
        );
        if (!p.ok) throw Error(`HTTP error! Status: ${p.status}`);
        u = await p.json();
        a = !0;
      } catch (p) {
        if (p.name === "AbortError")
          return (
            appendLog(
              d,
              "\ubcf4\uc720\ub7c9 API \ud638\ucd9c\uc774 \uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
            ),
            0
          );
        f--;
        if (f === 0)
          return (
            appendLog(
              d,
              `\ubcf4\uc720\ub7c9 Error: ${p.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
            ),
            0
          );
        appendLog(
          d,
          `\ubcf4\uc720\ub7c9 \uc7ac\uc2dc\ub3c4 \uc911... (${5 - f}/5)`
        );
      }
    return u && u.result === "SUCCESS" && u.data ? u.data.quantity : 0;
  }
  async function V(c, d, h) {
    let f = 1,
      a = [];
    for (;;) {
      const u = `${"https://contents-api.wrtn.ai/superchat/character-super-mode/payment-history?type=unlimited"}&page=${f}`;
      appendLog(
        d,
        `\ubb34\uc81c\ud55c \uacb0\uc81c \ub0b4\uc5ed ${f} \ud398\uc774\uc9c0 \ub85c\ub4dc \uc911...`
      );
      let p = 5,
        y = !1,
        k;
      for (; p > 0 && !y; )
        try {
          const r = await fetch(u, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${c}`,
              "Content-Type": "application/json",
            },
            signal: h.signal,
          });
          if (!r.ok) throw Error(`HTTP error! Status: ${r.status}`);
          k = await r.json();
          y = !0;
        } catch (r) {
          if (r.name === "AbortError")
            return (
              appendLog(
                d,
                "\uacb0\uc81c \ub0b4\uc5ed API \ud638\ucd9c\uc774 \uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
              ),
              a
            );
          p--;
          if (p === 0)
            return (
              appendLog(
                d,
                `\uacb0\uc81c \ub0b4\uc5ed Error: ${r.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
              ),
              a
            );
          appendLog(
            d,
            `\uacb0\uc81c \ub0b4\uc5ed \uc7ac\uc2dc\ub3c4 \uc911... (${
              5 - p
            }/5)`
          );
        }
      if (
        !k ||
        k.result !== "SUCCESS" ||
        !k.data ||
        !k.data.histories ||
        k.data.histories.length === 0
      ) {
        appendLog(
          d,
          "\ubb34\uc81c\ud55c \uacb0\uc81c \ub0b4\uc5ed \ud638\ucd9c \uc644\ub8cc."
        );
        break;
      }
      a = a.concat(k.data.histories);
      f++;
    }
    return a;
  }
  async function W(c, d, h, f, a, u, p, y, k, r, v, z) {
    const D = extractAccessToken();
    if (D) {
      appendLog(c, "\ube68\uac04\uc57d \uacc4\uc0b0 \uc2dc\uc791...");
      var e = new Date(),
        g = 1,
        m = [],
        w = [];
      if (y) {
        var b = localStorage.getItem("chasmRedpillHistory");
        b &&
          ((m = w = JSON.parse(b)),
          (a.style.display = "inline-block"),
          (u.style.display = "inline-block"));
      }
      var n =
        w.length > 0
          ? w.sort((t, q) => new Date(q.date) - new Date(t.date))[0]
          : null;
      // Crawling entrypoint (History / Payment)
      for (H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z); ; ) {
        w = `${"https://contents-api.wrtn.ai/superchat/crackers/history?limit=20&type=all"}&page=${g}`;
        appendPageLog(c, g);
        b = 5;
        let t = !1,
          jsonData;
        for (; b > 0 && !t; )
          try {
            const l = await fetch(w, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${D}`,
                "Content-Type": "application/json",
              },
              signal: p.signal,
            });
            if (!l.ok) throw Error(`HTTP error! Status: ${l.status}`);
            jsonData = await l.json();
            t = !0;
          } catch (l) {
            if (l.name === "AbortError") {
              appendLog(
                c,
                "API \ud638\ucd9c\uc774 \uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
              );
              k.disabled = !1;
              k.textContent = "\uacc4\uc0b0";
              a.style.display = m.length > 0 ? "inline-block" : "none";
              u.style.display = m.length > 0 ? "inline-block" : "none";
              return;
            }
            b--;
            if (b === 0) {
              appendLog(
                c,
                `Error: ${l.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
              );
              k.disabled = !1;
              k.textContent = "\uacc4\uc0b0";
              a.style.display = m.length > 0 ? "inline-block" : "none";
              u.style.display = m.length > 0 ? "inline-block" : "none";
              return;
            }
            appendLog(c, `\uc7ac\uc2dc\ub3c4 \uc911... (${5 - b}/5)`);
            await new Promise((B) => setTimeout(B, 500));
          }
        if (
          !jsonData ||
          jsonData.result !== "SUCCESS" ||
          !jsonData.data ||
          jsonData.data.length === 0
        ) {
          appendLog(
            c,
            `\uc804\uccb4 \uae30\ub85d \ud638\ucd9c \uc644\ub8cc! (\uc18c\uc694 \uc2dc\uac04: ${Q(
              e,
              new Date()
            )})`
          );
          a.style.display = "inline-block";
          u.style.display = "inline-block";
          k.disabled = !1;
          k.textContent = "\uacc4\uc0b0";
          H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z);
          break;
        }
        if (
          n &&
          jsonData.data.some((l) => l.date === n.date && l.title === n.title)
        ) {
          appendLog(
            c,
            `\uce90\uc2dc\ub41c \ub9c8\uc9c0\ub9c9 \uae30\ub85d\uc5d0 \ub3c4\ub2ec. \ud638\ucd9c \uc911\ub2e8. (\uc18c\uc694 \uc2dc\uac04: ${Q(
              e,
              new Date()
            )})`
          );
          a.style.display = "inline-block";
          u.style.display = "inline-block";
          k.disabled = !1;
          k.textContent = "\uacc4\uc0b0";
          H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z);
          break;
        }
        m = m.concat(jsonData.data);
        y && localStorage.setItem("chasmRedpillHistory", JSON.stringify(m));
        H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z);
        g++;
        await new Promise((l) => setTimeout(l, 500));
      }
    } else
      appendLog(c, "Error: access_token not found in cookies."),
        (k.disabled = !1),
        (k.textContent = "\uacc4\uc0b0"),
        (a.style.display = "none"),
        (u.style.display = "none");
  }
  async function performRedPillClick(c) {
    const prevModal = document.querySelector(".red-pill-modal");
    prevModal && prevModal.remove();
    let h = new AbortController(),
      f = !1;
    try {
      const darkTheme = document.body.dataset.theme === "dark",
        modal = document.createElement("div");
      modal.className = "red-pill-modal";
      modal.style.cssText =
        "\n                position: fixed;\n                top: 0;\n                left: 0;\n                width: 100%;\n                height: 100%;\n                background: rgba(0, 0, 0, 0.5);\n                z-index: 9999;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n            ";
      const p = document.createElement("div");
      p.style.cssText = `
                background: ${darkTheme ? "#1e1e1e" : "white"};
                color: ${darkTheme ? "#ffffff" : "black"};
                padding: 20px;
                border-radius: 5px;
                width: 80%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
      const y = document.createElement("div");
      y.style.cssText =
        "\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            ";
      const k = document.createElement("h2");
      k.id = "cr-title";
      k.style.cssText =
        "\n                margin: 0;\n                font-family: Pretendard;\n                display: flex;\n                align-items: baseline;\n                flex-shrink: 0;\n                letter-spacing: -1px;\n            ";
      k.innerHTML = `
                <span style="font-weight:800; letter-spacing: -1px;">\u2318 Chasm Crystallized</span>
                <span style="font-weight:600; margin-left: 5px; color: #ff0000;">redpill</span>
                <span style="font-weight:500; font-size: 0.7em; color: ${
                  darkTheme ? "#777" : "#999"
                }; margin-left: 8px;">${"v1.3.1"}</span>
            `;
      const r = document.createElement("button");
      r.id = "cr-close";
      r.innerHTML = "\u2715";
      r.style.cssText = `
                background: none;
                border: none;
                color: ${darkTheme ? "#777" : "#e0e0e0"};
                font-size: 1.2em;
                cursor: pointer;
                padding: 0;
            `;
      r.addEventListener("click", () => {
        h.abort();
        modal.remove();
      });
      y.appendChild(k);
      y.appendChild(r);
      const v = document.createElement("textarea");
      v.id = "cr-log";
      v.readOnly = !0;
      v.setAttribute("readonly", "readonly");
      v.style.cssText = `
                width: 100%;
                height: 100px;
                min-height: 100px;
                resize: none;
                padding: 10px;
                font-family: monospace;
                border: 1px solid ${darkTheme ? "#444" : "#ccc"};
                border-radius: 3px;
                background: ${darkTheme ? "#2a2a2a" : "#fff"};
                color: ${darkTheme ? "#ddd" : "#333"};
            `;
      const z = document.createElement("div");
      z.id = "cr-cache";
      z.style.cssText = "display: flex; align-items: center; gap: 10px;";
      const D = document.createElement("input");
      D.type = "checkbox";
      D.id = "cache-checkbox";
      D.checked = !0;
      const e = document.createElement("label");
      e.htmlFor = "cache-checkbox";
      e.textContent =
        "\ube68\uac04\uc57d \ub0b4\uc5ed \ube0c\ub77c\uc6b0\uc800 \uce90\uc2dc\uc5d0 \uc800\uc7a5 (\uc784\uc2dc \uc800\uc7a5)";
      e.style.cssText = `color: ${darkTheme ? "#ddd" : "#333"};`;
      const g = document.createElement("button");
      g.textContent = "\uc800\uc7a5 \ub0b4\uc5ed \uc0ad\uc81c";
      g.style.cssText = `
                padding: 5px 10px;
                background: ${darkTheme ? "#ff6666" : "#ff4444"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;
      g.addEventListener("click", () => {
        localStorage.removeItem("chasmRedpillHistory");
        eraseCache();
        appendLog(
          v,
          "\uce90\uc2dc\ub41c \ub0b4\uc5ed\uc774 \uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
        );
        H(l, B, I, [], darkTheme, J, [], F);
        b.style.display = "none";
        q.style.display = "none";
      });
      z.appendChild(D);
      z.appendChild(e);
      z.appendChild(g);
      const m = document.createElement("div");
      m.style.cssText =
        "\n                display: flex;\n                gap: 10px;\n                align-items: center;\n            ";
      const w = document.createElement("button");
      w.textContent = "\uacc4\uc0b0";
      w.style.cssText = `
                padding: 10px 20px;
                background: ${darkTheme ? "#cc0000" : "#ff0000"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;
      w.addEventListener("click", () => {
        f
          ? (h.abort(),
            (f = !1),
            (w.textContent = "\uacc4\uc0b0"),
            (w.disabled = !1),
            (b.style.display = E.length > 0 ? "inline-block" : "none"),
            (q.style.display = E.length > 0 ? "inline-block" : "none"))
          : confirm(
              "\ube68\uac04\uc57d \uacc4\uc0b0\uc740 \ubaa8\ub4e0 \uc0ac\uc6a9 \ub0b4\uc5ed\uc744 \ubd88\ub7ec\uc640 \ubd84\uc11d\ud569\ub2c8\ub2e4. \uacfc\ub2e4\ud55c API \ud638\ucd9c\uc740 \ubd80\uc815 \uc774\uc6a9\uc73c\ub85c \uac04\uc8fc\ub420 \uc218 \uc788\uc73c\uba70, \ub370\uc774\ud130 \uc591\uc5d0 \ub530\ub77c \uc2dc\uac04\uc774 \uc18c\uc694\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uacc4\uc18d\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"
            )
          ? ((f = !0),
            (w.textContent = "\uacc4\uc0b0 \uc911\uc9c0 \u23f3"),
            (w.disabled = !1),
            (b.style.display = "none"),
            (q.style.display = "none"),
            (h = new AbortController()),
            W(v, l, B, I, b, q, h, D.checked, w, J, L, F).finally(() => {
              f = !1;
              w.textContent = "\uacc4\uc0b0";
              w.disabled = !1;
              b.style.display = E.length > 0 ? "inline-block" : "none";
              q.style.display = E.length > 0 ? "inline-block" : "none";
            }))
          : ((f = !1), (w.textContent = "\uacc4\uc0b0"));
      });
      const b = document.createElement("button");
      b.id = "cr-raw-download";
      b.textContent = "\ub0b4\uc5ed \ub2e4\uc6b4";
      b.style.cssText = `
                padding: 10px 20px;
                background: ${darkTheme ? "#005588" : "#007bff"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                display: none;
            `;
      b.addEventListener("click", () => {
        var A = S(E, F);
        A = new Blob([A], { type: "text/csv;charset=utf-8;" });
        const G = document.createElement("a");
        G.href = URL.createObjectURL(A);
        G.download = `redpill_raw_data_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        G.click();
      });
      const n = document.createElement("button");
      n.textContent = "\ubd88\ub7ec\uc624\uae30";
      n.style.cssText = `
                padding: 10px 20px;
                background: ${darkTheme ? "#005588" : "#007bff"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;
      const t = document.createElement("input");
      t.type = "file";
      t.accept = ".csv";
      t.style.display = "none";
      n.addEventListener("click", () => {
        t.click();
      });
      t.addEventListener("change", (A) => {
        if ((A = A.target.files[0])) {
          var G = new FileReader();
          G.onload = (K) => {
            K = K.target.result
              .split("\n")
              .map((C) =>
                C.split(",").map((Y) => Y.trim().replace(/^"|"$/g, ""))
              );
            K.length < 2
              ? alert(
                  "\uc624\ub958: \uc62c\ubc14\ub978 \ub0b4\uc5ed \uc6d0\ubcf8 CSV \ud3ec\ub9f7\uc774 \uc544\ub2d9\ub2c8\ub2e4."
                )
              : K[0].join(",") !== "Date,Title,IsConsumed,Quantity,ConsumedType"
              ? alert(
                  "\uc624\ub958: \uc62c\ubc14\ub978 \ub0b4\uc5ed \uc6d0\ubcf8 CSV \ud3ec\ub9f7\uc774 \uc544\ub2d9\ub2c8\ub2e4."
                )
              : ((K = K.slice(1)
                  .filter(
                    (C) =>
                      C.length >= 4 &&
                      C[0] &&
                      C[1] &&
                      !isNaN(parseInt(C[3], 10))
                  )
                  .map((C) => ({
                    date: C[0],
                    title: C[1],
                    isConsumed: C[2].toLowerCase() === "true",
                    quantity: parseInt(C[3], 10),
                    consumedType: C[4] || "",
                  }))),
                K.length === 0
                  ? alert(
                      "\uc624\ub958: \uc720\ud6a8\ud55c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
                    )
                  : ((E = K),
                    localStorage.setItem(
                      "chasmRedpillHistory",
                      JSON.stringify(E)
                    ),
                    (F = {}),
                    E.forEach((C) => {
                      C = C.date.slice(0, 7);
                      F[C] = !0;
                    }),
                    H(l, B, I, E, darkTheme, J, L, F),
                    (b.style.display = "inline-block"),
                    (q.style.display = "inline-block"),
                    appendLog(
                      v,
                      "\ub0b4\uc5ed \uc6d0\ubcf8 CSV \ud30c\uc77c\uc774 \uc131\uacf5\uc801\uc73c\ub85c \ubd88\ub7ec\uc640\uc84c\uc2b5\ub2c8\ub2e4."
                    )));
          };
          G.readAsText(A);
          t.value = "";
        }
      });
      const q = document.createElement("button");
      q.id = "cr-stats-download";
      q.textContent = "\ud1b5\uacc4 \ub2e4\uc6b4";
      q.style.cssText = `
                padding: 10px 20px;
                background: ${darkTheme ? "#005588" : "#007bff"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                display: none;
            `;
      q.addEventListener("click", () => {
        var A = T(E, J, L, F);
        A = new Blob([A], { type: "text/csv;charset=utf-8;" });
        const G = document.createElement("a");
        G.href = URL.createObjectURL(A);
        G.download = `redpill_stats_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        G.click();
      });
      m.appendChild(w);
      m.appendChild(b);
      m.appendChild(n);
      m.appendChild(q);
      p.appendChild(t);
      const l = document.createElement("div");
      l.id = "cr-stat";
      l.style.cssText = `
                margin: 10px 0;
                padding: 10px;
                border: 1px solid ${darkTheme ? "#444" : "#ccc"};
                border-radius: 3px;
                background: ${darkTheme ? "#2a2a2a" : "#fff"};
            `;
      const B = document.createElement("div");
      B.id = "cr-calendar";
      B.style.cssText = `
                margin: 10px 0;
                color: ${darkTheme ? "#ddd" : "#333"};
            `;
      const I = document.createElement("div");
      I.id = "cr-ranking";
      I.style.cssText = `
                margin: 10px 0;
                color: ${darkTheme ? "#ddd" : "#333"};
            `;
      let E = [],
        J = 0,
        L = [],
        F = {};
      const M = extractAccessToken();
      if (M)
        try {
          (J = await U(M, v, h)),
            appendLog(v, `\ud604\uc7ac \ubcf4\uc720\ub7c9: ${J}`),
            (L = await V(M, v, h));
        } catch (A) {
          appendLog(
            v,
            `\ucd08\uae30 \ub370\uc774\ud130 \ub85c\ub4dc \uc624\ub958: ${A.message}`
          );
        }
      else appendLog(v, "Error: access_token not found in cookies.");
      localStorage.getItem("chasmRedpillHistory")
        ? ((E = JSON.parse(localStorage.getItem("chasmRedpillHistory"))),
          E.forEach((A) => {
            A = A.date.slice(0, 7);
            F[A] = !0;
          }),
          H(l, B, I, E, darkTheme, J, L, F),
          appendLog(
            v,
            "\uce90\uc2dc\ub41c \ub370\uc774\ud130 \ub85c\ub4dc \uc644\ub8cc."
          ),
          (b.style.display = "inline-block"),
          (q.style.display = "inline-block"))
        : H(l, B, I, E, darkTheme, J, L, F);
      p.appendChild(y);
      p.appendChild(v);
      p.appendChild(z);
      p.appendChild(m);
      p.appendChild(l);
      p.appendChild(B);
      p.appendChild(I);
      modal.appendChild(p);
      modal.style.display = "flex";
      document.body.appendChild(modal);
    } catch (a) {
      c &&
        (c.innerHTML =
          '<div display="flex" class="css-sv3fmv edj5hvk0">\ud83d\udc8a \ube68\uac04\uc57d</div>'),
        appendLog(
          document.createElement("textarea"),
          `\ubaa8\ub2ec \uc0dd\uc131 \uc624\ub958: ${a.message}`
        );
    }
  }
  function onClickRedPill(c) {
    c = c.currentTarget;
    // c.innerHTML =
    //   '<div display="flex" class="css-1h7hvl7 edj5hvk0">\u23f3</div>';
    performRedPillClick(c);
  }
  function insertButton() {
    if (/^\/cracker(\/.*)?$/.test(location.pathname)) {
      //   var c = Array.from(
      //     document.querySelectorAll('a[href="/cracker/history"]')
      //   ).find((d) => d.textContent.includes("\uc804\uccb4 \ub0b4\uc5ed"));
      var redPillButtons = document.querySelectorAll(".red-pill-button");
      if (redPillButtons && redPillButtons.length > 0) {
        // Check color state
        let nodes = redPillButtons[0].parentElement.childNodes;
        let unselected = undefined;
        for (let node of nodes) {
          let textNode = node.childNodes[0].childNodes[0];
          if (textNode.getAttribute("color") === "text_secondary") {
            unselected = textNode;
            break;
          }
        }
        if (!unselected) {
          console.log(
            "Chasm Crystallized RedPill: Warning: No alternative text found"
          );
        }
        let redPillText = redPillButtons[0].childNodes[0].childNodes[0];
        if (redPillText.className != unselected.className) {
          redPillText.className = unselected.className;
        }
        return;
      }
      var menuBar = document.querySelectorAll(".css-w5f5cr");
      if (menuBar && menuBar.length > 0) {
        menuBar[0].style.cssText = "max-width: 800px;";
        const newButtonElement = document.createElement("div");
        // To follow theme color and prevent bugs
        const origin = menuBar[0].childNodes[0];
        const originButton = origin.childNodes[0];
        const originText = originButton.childNodes[0];
        newButtonElement.className = "red-pill-button " + origin.className;
        newButtonElement.setAttribute("display", "flex");
        newButtonElement.innerHTML =
          '<button height="100%" display="flex" class="' +
          originButton.className +
          '"><p color="text_secondary" class="' +
          originText.className +
          '">\ud83d\udc8a \ubd89\uc740\uc57d</p></button>';
        // d.color = "text_primary";
        // d.className = "red-pill-button css-noipum edj5hvk1";
        // d.style.cssText =
        //   'background: red; border-radius: 5px; border-color: #0f0f0f;color: white; padding: 4px; font-size: 15px; font-weight: bolder; font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, ' +
        //   'BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell","Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif,"IBMPlexMono-Regular" !important; ' +
        //   "-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;} ";
        // d.innerHTML =
        //   '<div display="flex">\ud83d\udc8a \ube68\uac04\uc57d</div>';
        newButtonElement.addEventListener("click", onClickRedPill);
        menuBar[0].append(newButtonElement);
        for (let component of menuBar[0].childNodes) {
          component.style.cssText = "flex-basis: 50px;";
        }
      }
    }
  }
  /**
   * 페이지의 상태 옵저버를 추가하고, 처음 실행되거나 URL이 변경될 때마다 업데이트를 수행합니다.
   */
  function setup() {
    insertButton();
    let oldHref = location.href;
    new MutationObserver(() => {
      const newHref = location.href;
      newHref !== oldHref && ((oldHref = newHref), performInitialization());
    }).observe(document, { subtree: !0, childList: !0 });
    observerCreator(document.body, () => {
      performInitialization();
    });
  }
  const observerCreator = (function () {
    const observerFactory =
      window.MutationObserver || window.WebKitMutationObserver;
    return function (body, lambda) {
      if (body && observerFactory) {
        var observer = new observerFactory((a) => {
          lambda(a);
        });
        observer.observe(body, { childList: !0, subtree: !0, attributes: !0 });
        return observer;
      }
    };
  })();
  // ==========================================
  //             C2 오리지널 컨텐츠
  // ==========================================
  // ###########################
  //          C2 변수
  // ###########################
  let cachedResult = undefined;
  let processing = false;

  function findSidePanel() {
    const element = document.getElementsByClassName("css-3vigoi");
    if (element === undefined || element.length <= 0) {
      logError("No side panel class found");
      return undefined;
    }
    return element[0];
  }

  function injectRefreshButton(panel) {
    // To follow theme change
    const expectedClass = isDarkMode()
      ? "css-sv3fmv efhw7t80"
      : "css-xohevx efhw7t80";
    // Pre-condition check - Prevent duplicated button
    const existing = document.getElementsByClassName("red-pill-refresh-button");
    if (existing && existing.length > 0) {
      const button = existing[0].childNodes[0];
      if (button.className !== expectedClass) {
        button.className = expectedClass;
      }
      return;
    }
    const div = document.createElement("div");
    div.className = "css-8v90jo efhw7t80 red-pill-refresh-button";
    div.display = "flex";
    const button = document.createElement("button");
    button.className = expectedClass;
    button.display = "flex";
    button.setAttribute("color", "text_primary");
    button.style.cssText = "margin-right: 5px";
    button.innerHTML =
      '<div display="flex" width="100%" class="css-1dp6yu8 eh9908w0">통계 새로고침</div>';
    div.append(button);
    panel.childNodes[0].insertBefore(div, panel.childNodes[0].childNodes[2]);
    div.addEventListener("click", () => {
      if (processing) {
        return;
      }
      if (!localStorage.getItem("rp-lastParse")) {
        if (
          !confirm(
            "이전에 통계를 불러온 전적이 존재하지 않습니다.\n이 작업은 매우 오래 걸리고, 완전히 불러오기 전까지는 이 페이지를 벗어나면 안됩니다.\n또한, 다른 탭으로 통계를 불러오는 행위는 캐시의 오염을 불러올 수 있습니다.\n또한, 이 기능은 모든 사용 내역을 불러와 분석하기에, 과다한 호출이 발생할 경우 부정 이용으로 간주될 수 있습니다.\n정말로 통계를 새로 고치시겠습니까?"
          )
        ) {
          return;
        }
      }
      processing = true;
      div.style.cssText = 'style = "background-color: #9c9c9c87;"';
      button.innerHTML =
        '<div display="flex" width="100%" class="css-1dp6yu8 eh9908w0">불러오는 중..</div>';
      safeLoadAll().then(() => {
        processing = false;
        div.style.cssText = "";
        button.innerHTML =
          '<div display="flex" width="100%" class="css-1dp6yu8 eh9908w0">통계 새로고침</div>';

        injectAllCrackerUsage(cachedResult);
      });
    });
  }

  function isDarkMode() {
    return document.body.getAttribute("data-theme") === "dark";
  }

  function isLightMode() {
    return document.body.getAttribute("data-theme") === "light";
  }

  function injectCrackerUsageContainer(
    node,
    index,
    superChat,
    cracker,
    integrationMode
  ) {
    if (superChat <= 0 && cracker <= 0) {
      deleteCrackerUsage(node, index);
      return;
    }
    if (!integrationMode) {
      let url = node.getAttribute("href");
      if (!url) {
        logWarning("No href found from chatting node element");
        return;
      } else {
        log("Inserting realtime usage to index " + index + " (ID " + url + ")");
      }
    }
    let existings = node.querySelectorAll(".red-pill-realtime-usage");
    if (existings && existings.length > 0) {
      // To prevent duplicated injection
      return;
    }
    // Force increase height of root container
    const container = node.childNodes[0];
    if (!isIntegrationMode) {
      container.style.cssText = "height: 84px; padding-top: 5px;";
    }
    const description = container.childNodes[1];
    // Creating text node container (Theme controller)
    const crackerContainerNode = document.createElement("div");
    crackerContainerNode.setAttribute("display", "flex");
    crackerContainerNode.setAttribute("width", "100%");
    crackerContainerNode.className = "red-pill-realtime-usage";
    crackerContainerNode.setAttribute("last-cracker", "0");
    crackerContainerNode.setAttribute("last-superchat", "0");
    if (integrationMode) {
      crackerContainerNode.style.cssText =
        "display: flex; flex-direction: row; align-items: center; margin-top: 0px; margin-left: 15px;";
      node.append(crackerContainerNode);
    } else {
      crackerContainerNode.style.cssText =
        "display: flex; flex-direction: row; align-items: center; margin-top: -5px;";
      description.append(crackerContainerNode);
    }
  }

  function updateUsage(node, index, superChat, cracker) {
    if (superChat <= 0 && cracker <= 0) {
      deleteCrackerUsage(node, index);
      return;
    }
    let crackerContainerNodes = node.getElementsByClassName(
      "red-pill-realtime-usage"
    );
    if (!crackerContainerNodes || crackerContainerNodes.length <= 0) {
      injectCrackerUsageContainer(
        node,
        index,
        superChat,
        cracker,
        isIntegrationMode
      );
    }
    crackerContainerNodes = node.getElementsByClassName(
      "red-pill-realtime-usage"
    );
    if (!crackerContainerNodes || crackerContainerNodes.length <= 0) {
      logError("Failed to inject cracker content; Element not injected");
      return;
    }
    const crackerContainerNode = crackerContainerNodes[0];
    if (
      crackerContainerNode.getAttribute("last-cracker") ===
        cracker.toString() &&
      crackerContainerNode.getAttribute("last-superchat") ===
        superChat.toString()
    ) {
      return;
    }
    crackerContainerNode.setAttribute("last-cracker", cracker.toString());
    crackerContainerNode.setAttribute("last-superchat", superChat.toString());
    if (crackerContainerNode) crackerContainerNode.innerHTML = "";
    if (cracker > 0) {
      // Creating text node (Cracker usages)
      const textContent = document.createElement("p");
      textContent.className = isDarkMode()
        ? "chat-list-item-topic css-1a0pj6v efhw7t80"
        : "chat-list-item-character-name css-qwz0be efhw7t80";
      textContent.style.cssText = "margin-right: 3px";
      textContent.innerText = cracker.toLocaleString(undefined, {
        minimumFractionDigits: 0,
      });
      const svg = createCrackerSvg();
      svg.style.marginRight = "4px";
      // Assemble cracker contents
      crackerContainerNode.append(textContent);
      crackerContainerNode.append(svg);
    }
    if (superChat > 0) {
      // Creating text node (Cracker usages)
      const textContent = document.createElement("p");
      textContent.className = isDarkMode()
        ? "chat-list-item-topic css-1a0pj6v efhw7t80"
        : "chat-list-item-character-name css-qwz0be efhw7t80";
      textContent.style.cssText = "margin-right: 3px";
      textContent.innerText = superChat.toLocaleString(undefined, {
        minimumFractionDigits: 0,
      });
      // Assemble cracker contents
      crackerContainerNode.append(textContent);
      crackerContainerNode.append(createSuperChatSvg());
    }
  }

  function deleteCrackerUsage(node, index) {
    let existings = node.getElementsByClassName("red-pill-realtime-usage");
    if (!existings || existings.length <= 0) {
      // To prevent duplicated injection
      return;
    }
    const container = node.childNodes[0];
    container.style.cssText = "";
    const crackerContainerNodes = container.getElementsByClassName(
      "red-pill-realtime-usage"
    );
    if (crackerContainerNodes && crackerContainerNodes.length > 0) {
      crackerContainerNodes[0].remove();
    }
  }

  function injectIntegrationNode() {
    const nodes = document.getElementsByClassName(
      "chasm-fold-category-integration"
    );
    for (let index = 0; index < nodes.length; index++) {
      const title = nodes[index].getAttribute("chasm-fold-article-origin");
      updateUsage(
        nodes[index],
        index,
        cachedResult[title]?.superchat ?? 0,
        cachedResult[title]?.cracker ?? 0
      );
    }
  }
  function injectAllCrackerUsage() {
    loadLocalCache();
    if (isIntegrationMode) {
      injectIntegrationNode();
      return;
    }
    if (
      document.getElementsByClassName("chasm-fold-category-integration")
        .length > 0
    ) {
      log("Fold update detected. Running as integration mode");
      isIntegrationMode = true;
      injectIntegrationNode();
      return;
    }
    // Check integration first
    let selected = document.getElementsByTagName("a");
    const nodes = [];
    for (let node of selected) {
      if (node.getAttribute("href").startsWith("/u/")) {
        nodes.push(node);
      }
    }
    if (!nodes || nodes.length <= 0) {
      logWarning(
        "No chattings found; Does crack updated, or no chatting started?"
      );
      return;
    }

    for (let index = 0; index < nodes.length; index++) {
      if (nodes[index].nodeName.toLowerCase() === "a") {
        const title = extractTitleFromNode(nodes[index]);
        updateUsage(
          nodes[index],
          index,
          cachedResult[title]?.superchat ?? 0,
          cachedResult[title]?.cracker ?? 0
        );
      } else {
        logWarning(
          "Cannot determine chatting id from index " +
            index +
            ": Parent node is not link node (Expected 'a', Value '" +
            nodes[index].nodeName.toLowerCase() +
            "'"
        );
      }
    }
    // "https://contents-api.wrtn.ai/superchat/character-super-mode/history?limit=20&type=all"}&page=${g}
  }

  async function safeLoadAll() {
    const oldCache = structuredClone(cachedResult);
    try {
      await loadAll();
    } catch (error) {
      logError(
        "Failed to load history due to error. Injecting to UI with last fetched data."
      );
      if (error.message && error.message.startsWith("CRYS: ")) {
        alert(error.message.substring(6));
      }
      console.log(error);
      //   cachedResult = oldCache;
      injectAllCrackerUsage(cachedResult);
    }
  }

  async function loadAll() {
    loadLocalCache();
    const token = extractAccessToken();
    let page = 1;
    let lastParse = undefined;
    if (localStorage.getItem("rp-lastParse")) {
      lastParse = new Date(localStorage.getItem("rp-lastParse"));
      log("Previous history found. Parsing after " + lastParse);
    } else {
      log(
        "No successful parse history found. Redpill will try load all history"
      );
      localStorage.removeItem("rp-parseHistory");
      cachedResult = {};
      injectAllCrackerUsage();
    }
    if (localStorage.getItem("rp-parseHistory")) {
      log("History data found. Loading from local storage..");
      const start = new Date();
      history = JSON.parse(localStorage.getItem("rp-parseHistory"));
      log(
        "History loaded in " + (new Date().getTime() - start.getTime()) + "ms"
      );
    }
    let menuMap = createMenuMapFor();
    let newestParse = undefined;
    let requireStop = false;
    let count = 0;
    let retry = 0;
    while (!requireStop) {
      if (count++ >= 20) {
        await new Promise((r) => setTimeout(r, 50));
      } else if (count % 4 == 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
      let result = undefined;
      while (result === undefined) {
        try {
          let fetched = await fetch(
            "https://contents-api.wrtn.ai/superchat/crackers/history?limit=20&type=consumed&page=" +
              page++,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!fetched.ok) {
            if (retry++ >= 5) {
              throw new Error(
                "CRYS: 최대 재시도 횟수 이상으로 요청에서 오류가 발생하였습니다.\n나중에 다시 시도하세요."
              );
            } else {
              logError(
                "Server returned HTTP code " +
                  fetched.status +
                  ", retrying after 100ms"
              );
              await new Promise((r) => setTimeout(r, 100));
            }
            continue;
          } else {
            result = fetched;
          }
        } catch (error) {
          if (retry++ >= 5) {
            throw new Error(
              "CRYS: 최대 재시도 횟수 이상으로 요청에서 오류가 발생하였습니다.\n나중에 다시 시도하세요."
            );
          } else {
            logError("Unexpected error occured, retry after 100ms");
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      retry = 0;
      let json = await result.json();
      if (!json.data || json.data.length <= 0) {
        log("STOPPING! No data returned, or end of the page?");
        requireStop = true;
        break;
      }
      let purchaseHistory = json.data;
      for (let data of purchaseHistory) {
        let purchaseTime = new Date(data.date);
        if (lastParse && purchaseTime.getTime() <= lastParse.getTime()) {
          log("STOPPING! Reached last parsing history.");
          requireStop = true;
          break;
        }
        if (!newestParse) {
          newestParse = data.date;
        }
        const title = data.title;
        if (!cachedResult[title]) {
          cachedResult[title] = {
            cracker: 0,
            superchat: 0,
          };
        }
        const balance = data.balance.total;
        if (data.product === "cracker") {
          cachedResult[title].cracker += balance;
        } else if (data.product === "superchat") {
          cachedResult[title].superchat += balance;
        } else {
          logWarning(
            "Unknown product type '" +
              data.product +
              "' from article '" +
              title +
              "'"
          );
        }
        let node = menuMap[title];
        if (node) {
          injectAllCrackerUsage();
        }
      }
    }

    if (newestParse) {
      localStorage.setItem("rp-lastParse", newestParse);
    }
    localStorage.setItem("rp-parseHistory", JSON.stringify(cachedResult));
    log("All system set, updating all nodes");
    injectAllCrackerUsage();
    return history;
  }

  function createMenuMapFor() {
    let selected = document.querySelectorAll(".css-16q3jhz");
    const map = {};
    for (let node of selected) {
      let title = extractTitleFromNode(node.parentElement);
      map[title] = node.parentElement;
    }
    return map;
  }

  function extractTitleFromNode(node) {
    return node.childNodes[0].childNodes[1].childNodes[0].innerText;
  }
  function createCrackerSvg() {
    const svg = document.createElement("div");
    svg.style.cssText = "height: fit-content; margin-top: 2px;";
    svg.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16"><path fill="#FFA600" d="M21.17 12.01c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21c.06-.07.12-.14.17-.21 0 0 .01-.02.02-.02.05-.07.1-.14.14-.21 0-.02.02-.03.03-.05.04-.07.08-.13.11-.2.01-.02.02-.05.04-.08.03-.06.06-.13.09-.2.01-.03.03-.07.04-.11l.06-.18c.01-.05.02-.1.04-.14.01-.05.03-.1.04-.16l.03-.19c0-.04.01-.09.02-.13 0-.11.01-.22.01-.33 0-1.86-1.51-3.37-3.37-3.37-.11 0-.22 0-.33.01-.04 0-.08 0-.12.02-.07 0-.13.02-.19.03-.05 0-.1.02-.16.04-.05.01-.1.02-.14.04l-.18.06c-.04.01-.07.02-.11.04-.07.02-.13.05-.19.09a.3.3 0 0 0-.08.04c-.07.03-.14.07-.2.11-.02 0-.03.02-.05.03-.07.04-.14.09-.21.14 0 0-.02.01-.02.02-.07.05-.14.11-.21.17-.59-.51-1.36-.83-2.21-.83s-1.62.31-2.21.83a3.32 3.32 0 0 0-2.21-.83c-.85 0-1.62.31-2.21.83-.07-.06-.14-.12-.21-.17 0 0-.02-.01-.02-.02-.07-.05-.14-.1-.21-.14-.02 0-.03-.02-.05-.03-.07-.04-.13-.08-.2-.11-.02-.01-.05-.02-.08-.04-.06-.03-.13-.06-.2-.09-.03-.01-.07-.03-.11-.04l-.18-.06c-.05-.01-.1-.02-.14-.04-.05-.01-.1-.03-.16-.04l-.19-.03c-.04 0-.09-.01-.13-.02-.11 0-.22-.01-.33-.01-1.86 0-3.37 1.51-3.37 3.37 0 .11 0 .22.01.33 0 .04 0 .08.02.12 0 .07.02.13.03.19 0 .05.02.1.04.16.01.05.02.1.04.14l.06.18c.01.04.02.07.04.11.02.07.05.13.09.19a.3.3 0 0 0 .04.08c.03.07.07.14.11.2 0 .02.02.03.03.05.04.07.09.14.14.21 0 0 .01.02.02.02.05.07.11.14.17.21a3.32 3.32 0 0 0-.83 2.21c0 .85.31 1.62.83 2.21a3.32 3.32 0 0 0-.83 2.21c0 .85.31 1.62.83 2.21-.06.07-.12.14-.17.21 0 0-.01.02-.02.02-.05.07-.1.14-.14.21 0 .02-.02.03-.03.05-.04.07-.08.13-.11.2-.01.02-.02.05-.04.08-.03.06-.06.13-.09.2-.01.03-.03.07-.04.11l-.06.18c-.01.05-.02.1-.04.14-.01.05-.03.1-.04.16l-.03.19c0 .04-.01.09-.02.13 0 .11-.01.22-.01.33A3.35 3.35 0 0 0 3.02 21c.61.61 1.45.99 2.38.99.11 0 .22 0 .33-.01.04 0 .08 0 .12-.02.07 0 .13-.02.19-.03.05 0 .1-.02.16-.04.05-.01.1-.02.14-.04l.18-.06c.04-.01.07-.02.11-.04.07-.02.13-.05.19-.09a.3.3 0 0 0 .08-.04c.07-.03.14-.07.2-.11.02 0 .03-.02.05-.03.07-.04.14-.09.21-.14 0 0 .02-.01.02-.02.07-.05.14-.11.21-.17.59.51 1.36.83 2.21.83s1.62-.31 2.21-.83c.59.52 1.36.83 2.21.83s1.62-.31 2.21-.83c.07.06.14.12.21.17 0 0 .02.01.02.02.07.05.14.1.21.14.02 0 .03.02.05.03.07.04.13.08.2.11.02.01.05.02.08.04.06.03.13.06.2.09.03.01.07.03.11.04l.18.06c.05.01.1.02.14.04.05.01.1.03.16.04l.19.03c.04 0 .09.01.13.02.11 0 .22.01.33.01.92 0 1.75-.37 2.36-.97l.02-.02c.61-.61.99-1.45.99-2.38 0-.11 0-.22-.01-.33 0-.04 0-.08-.02-.12 0-.07-.02-.13-.03-.19 0-.05-.02-.1-.04-.16a.6.6 0 0 0-.04-.14l-.06-.18a.5.5 0 0 0-.04-.11.7.7 0 0 0-.09-.19.3.3 0 0 0-.04-.08c-.03-.07-.07-.14-.11-.2 0-.02-.02-.03-.03-.05-.04-.07-.09-.14-.14-.21 0 0-.01-.02-.02-.02-.05-.07-.11-.14-.17-.21.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21M7.5 13.5 6 12l1.5-1.5L9 12zM12 6l1.5 1.5L12 9l-1.5-1.5zm0 12-1.5-1.5L12 15l1.5 1.5zm4.5-4.5L15 12l1.5-1.5L18 12z"></path></svg>';
    return svg;
  }

  function createSuperChatSvg() {
    const svg = document.createElement("div");
    svg.style.cssText = "height: fit-content; margin-top: 4px;";
    svg.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16"><path fill="#1A88FF" d="M12.621 1.98c-5.414-.322-10.067 3.8-10.39 9.207a9.73 9.73 0 0 0 1.633 6.023l-.586 4.988 5.3-1.238c.896.34 1.86.558 2.87.618 5.415.323 10.067-3.8 10.39-9.207.323-5.406-3.81-10.067-9.217-10.39"></path><path fill="#fff" d="M16.07 12.21s-.01-.05-.02-.08c-.16-.73-.52-1.31-.86-1.71a18 18 0 0 0-.29-.33 8 8 0 0 1-.92-1.18s0-.01-.01-.02c0 0 0-.01-.01-.02-.52-.84-.88-1.78-1.05-2.79-.8.24-1.48.76-1.93 1.45-.02.03-.04.07-.07.11-.26.43-.42.93-.47 1.46 0 .1-.01.2-.01.31 0 .51.11.99.31 1.43a1.63 1.63 0 0 1-1.15-1.33c-.82.51-1.44 1.31-1.73 2.25 0 0 0 .03-.01.04-.09.31-.15.64-.16.98v.29c0 .26.04.52.1.77v.02c0 .01 0 .03.01.04.28 1.13 1.05 2.07 2.08 2.62.6.32 1.29.5 2.02.5h.01c2.34 0 4.23-1.81 4.24-4.05 0-.26-.02-.51-.07-.76z"></path></svg>';
    return svg;
  }

  function loadLocalCache() {
    if (cachedResult === undefined) {
      if (localStorage.getItem("rp-parseHistory")) {
        cachedResult = JSON.parse(localStorage.getItem("rp-parseHistory"));
      } else {
        cachedResult = {};
      }
    }
  }

  function log(message) {
    console.log(
      "%cChasm Crystallized RedPill: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized RedPill: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized RedPill: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

  function eraseCache() {
    processing = true;
    localStorage.removeItem("rp-lastParse");
    localStorage.removeItem("rp-parseHistory");
    cachedResult = {};
    injectAllCrackerUsage();
    processing = false;
  }

  function performInitialization() {
    // No initialization will perform while processing
    if (processing) {
      return;
    }
    insertButton();
    const panel = findSidePanel();
    if (panel) {
      loadLocalCache();
      injectRefreshButton(panel);
      injectAllCrackerUsage();
    }
  }
  // ==========================================
  //                초기화
  // ==========================================

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", setup)
    : setup();
  window.addEventListener("load", setup);
})();
