// ==UserScript==
// @name        Chasm Crystallized RedPill (결정화 캐즘 붉은약)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-PILL-v1.1.0
// @description 크랙의 통계 수정 및 데이터 표시 개선. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      chasm-js, milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/redpill.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/redpill.user.js
// @grant       none
// ==/UserScript==
(function () {
  function P() {
    const c = document.cookie.split(";");
    for (let d of c) {
      const [h, f] = d.trim().split("=");
      if (h === "access_token") return f;
    }
    return null;
  }
  function x(c, d) {
    const h = new Date().toLocaleString();
    c.value = `[${h}]\n${d}\n\n${c.value}`;
    c.scrollTop = 0;
  }
  function R(c, d) {
    const h = c.value.split("\n"),
      f = h.findIndex(
        (a) =>
          a.includes("\uc0ac\uc6a9\ub0b4\uc5ed") &&
          a.match(/\ud398\uc774\uc9c0 \ub85c\ub4dc\ub428$/)
      );
    f >= 0 && (h.splice(f - 1, 3), (c.value = h.join("\n")));
    x(c, `\uc0ac\uc6a9\ub0b4\uc5ed ${d} \ud398\uc774\uc9c0 \ub85c\ub4dc\ub428`);
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
    const v = k.filter((b) => b.isConsumed).reduce((b, n) => b + n.quantity, 0),
      z = k.filter((b) => !b.isConsumed).reduce((b, n) => b + n.quantity, 0),
      D = k
        .filter((b) => b.isConsumed && b.consumedType === "unlimited")
        .reduce((b, n) => b + n.quantity, 0),
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
      g[t][q][n] = (g[t][q][n] || 0) + b.quantity;
      g[t][b.isConsumed ? "totalConsumption" : "totalAcquisition"] +=
        b.quantity;
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
      m[b.title] = (m[b.title] || 0) + b.quantity;
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
    const u = c.filter((e) => e.isConsumed).reduce((e, g) => e + g.quantity, 0),
      p = c.filter((e) => !e.isConsumed).reduce((e, g) => e + g.quantity, 0),
      y = c
        .filter((e) => e.isConsumed && e.consumedType === "unlimited")
        .reduce((e, g) => e + g.quantity, 0),
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
      m[g] = (m[g] || 0) + e.quantity;
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
      z[m][w][g] = (z[m][w][g] || 0) + e.quantity;
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
      D[e.title] = (D[e.title] || 0) + e.quantity;
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
            x(
              d,
              "\ubcf4\uc720\ub7c9 API \ud638\ucd9c\uc774 \uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
            ),
            0
          );
        f--;
        if (f === 0)
          return (
            x(
              d,
              `\ubcf4\uc720\ub7c9 Error: ${p.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
            ),
            0
          );
        x(d, `\ubcf4\uc720\ub7c9 \uc7ac\uc2dc\ub3c4 \uc911... (${5 - f}/5)`);
      }
    return u && u.result === "SUCCESS" && u.data ? u.data.quantity : 0;
  }
  async function V(c, d, h) {
    let f = 1,
      a = [];
    for (;;) {
      const u = `${"https://contents-api.wrtn.ai/superchat/character-super-mode/payment-history?type=unlimited"}&page=${f}`;
      x(
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
              x(
                d,
                "\uacb0\uc81c \ub0b4\uc5ed API \ud638\ucd9c\uc774 \uc0ac\uc6a9\uc790\uc5d0 \uc758\ud574 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
              ),
              a
            );
          p--;
          if (p === 0)
            return (
              x(
                d,
                `\uacb0\uc81c \ub0b4\uc5ed Error: ${r.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
              ),
              a
            );
          x(
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
        x(
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
    const D = P();
    if (D) {
      x(c, "\ube68\uac04\uc57d \uacc4\uc0b0 \uc2dc\uc791...");
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
      for (H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z); ; ) {
        w = `${"https://contents-api.wrtn.ai/superchat/character-super-mode/history?limit=20&type=all"}&page=${g}`;
        R(c, g);
        b = 5;
        let t = !1,
          q;
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
            q = await l.json();
            t = !0;
          } catch (l) {
            if (l.name === "AbortError") {
              x(
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
              x(
                c,
                `Error: ${l.message} (\uc7ac\uc2dc\ub3c4 \ud69f\uc218 \ucd08\uacfc)`
              );
              k.disabled = !1;
              k.textContent = "\uacc4\uc0b0";
              a.style.display = m.length > 0 ? "inline-block" : "none";
              u.style.display = m.length > 0 ? "inline-block" : "none";
              return;
            }
            x(c, `\uc7ac\uc2dc\ub3c4 \uc911... (${5 - b}/5)`);
            await new Promise((B) => setTimeout(B, 500));
          }
        if (!q || q.result !== "SUCCESS" || !q.data || q.data.length === 0) {
          x(
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
        if (n && q.data.some((l) => l.date === n.date && l.title === n.title)) {
          x(
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
        m = m.concat(q.data);
        y && localStorage.setItem("chasmRedpillHistory", JSON.stringify(m));
        H(d, h, f, m, document.body.dataset.theme === "dark", r, v, z);
        g++;
        await new Promise((l) => setTimeout(l, 500));
      }
    } else
      x(c, "Error: access_token not found in cookies."),
        (k.disabled = !1),
        (k.textContent = "\uacc4\uc0b0"),
        (a.style.display = "none"),
        (u.style.display = "none");
  }
  async function X(c) {
    const d = document.querySelector(".red-pill-modal");
    d && d.remove();
    let h = new AbortController(),
      f = !1;
    try {
      const a = document.body.dataset.theme === "dark",
        u = document.createElement("div");
      u.className = "red-pill-modal";
      u.style.cssText =
        "\n                position: fixed;\n                top: 0;\n                left: 0;\n                width: 100%;\n                height: 100%;\n                background: rgba(0, 0, 0, 0.5);\n                z-index: 9999;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n            ";
      const p = document.createElement("div");
      p.style.cssText = `
                background: ${a ? "#1e1e1e" : "white"};
                color: ${a ? "#ffffff" : "black"};
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
                  a ? "#777" : "#999"
                }; margin-left: 8px;">${"v1.0.0"}</span>
            `;
      const r = document.createElement("button");
      r.id = "cr-close";
      r.innerHTML = "\u2715";
      r.style.cssText = `
                background: none;
                border: none;
                color: ${a ? "#777" : "#e0e0e0"};
                font-size: 1.2em;
                cursor: pointer;
                padding: 0;
            `;
      r.addEventListener("click", () => {
        h.abort();
        u.remove();
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
                border: 1px solid ${a ? "#444" : "#ccc"};
                border-radius: 3px;
                background: ${a ? "#2a2a2a" : "#fff"};
                color: ${a ? "#ddd" : "#333"};
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
      e.style.cssText = `color: ${a ? "#ddd" : "#333"};`;
      const g = document.createElement("button");
      g.textContent = "\uc800\uc7a5 \ub0b4\uc5ed \uc0ad\uc81c";
      g.style.cssText = `
                padding: 5px 10px;
                background: ${a ? "#ff6666" : "#ff4444"};
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;
      g.addEventListener("click", () => {
        localStorage.removeItem("chasmRedpillHistory");
        x(
          v,
          "\uce90\uc2dc\ub41c \ub0b4\uc5ed\uc774 \uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."
        );
        H(l, B, I, [], a, J, [], F);
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
                background: ${a ? "#cc0000" : "#ff0000"};
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
                background: ${a ? "#005588" : "#007bff"};
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
                background: ${a ? "#005588" : "#007bff"};
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
                    H(l, B, I, E, a, J, L, F),
                    (b.style.display = "inline-block"),
                    (q.style.display = "inline-block"),
                    x(
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
                background: ${a ? "#005588" : "#007bff"};
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
                border: 1px solid ${a ? "#444" : "#ccc"};
                border-radius: 3px;
                background: ${a ? "#2a2a2a" : "#fff"};
            `;
      const B = document.createElement("div");
      B.id = "cr-calendar";
      B.style.cssText = `
                margin: 10px 0;
                color: ${a ? "#ddd" : "#333"};
            `;
      const I = document.createElement("div");
      I.id = "cr-ranking";
      I.style.cssText = `
                margin: 10px 0;
                color: ${a ? "#ddd" : "#333"};
            `;
      let E = [],
        J = 0,
        L = [],
        F = {};
      const M = P();
      if (M)
        try {
          (J = await U(M, v, h)),
            x(v, `\ud604\uc7ac \ubcf4\uc720\ub7c9: ${J}`),
            (L = await V(M, v, h));
        } catch (A) {
          x(
            v,
            `\ucd08\uae30 \ub370\uc774\ud130 \ub85c\ub4dc \uc624\ub958: ${A.message}`
          );
        }
      else x(v, "Error: access_token not found in cookies.");
      localStorage.getItem("chasmRedpillHistory")
        ? ((E = JSON.parse(localStorage.getItem("chasmRedpillHistory"))),
          E.forEach((A) => {
            A = A.date.slice(0, 7);
            F[A] = !0;
          }),
          H(l, B, I, E, a, J, L, F),
          x(
            v,
            "\uce90\uc2dc\ub41c \ub370\uc774\ud130 \ub85c\ub4dc \uc644\ub8cc."
          ),
          (b.style.display = "inline-block"),
          (q.style.display = "inline-block"))
        : H(l, B, I, E, a, J, L, F);
      p.appendChild(y);
      p.appendChild(v);
      p.appendChild(z);
      p.appendChild(m);
      p.appendChild(l);
      p.appendChild(B);
      p.appendChild(I);
      u.appendChild(p);
      u.style.display = "flex";
      document.body.appendChild(u);
    } catch (a) {
      c &&
        (c.innerHTML =
          '<div display="flex" class="css-sv3fmv edj5hvk0">\ud83d\udc8a \ube68\uac04\uc57d</div>'),
        x(
          document.createElement("textarea"),
          `\ubaa8\ub2ec \uc0dd\uc131 \uc624\ub958: ${a.message}`
        );
    }
  }
  function Z(c) {
    c = c.currentTarget;
    // c.innerHTML =
    //   '<div display="flex" class="css-1h7hvl7 edj5hvk0">\u23f3</div>';
    X(c);
  }
  function N() {
    if (/^\/cracker(\/.*)?$/.test(location.pathname)) {
      //   var c = Array.from(
      //     document.querySelectorAll('a[href="/cracker/history"]')
      //   ).find((d) => d.textContent.includes("\uc804\uccb4 \ub0b4\uc5ed"));
      var existCheck = document.querySelectorAll(".red-pill-button");
      if (existCheck && existCheck.length > 0) {
        // Check color state
        let nodes = existCheck[0].parentElement.childNodes;
        let unselected = undefined;
        for (let node of nodes) {
            let textNode = node.childNodes[0].childNodes[0];
            if (textNode.getAttribute("color") === "text_secondary") {
                unselected = textNode;
                break;
            }
        }
        if (!unselected) {
            console.log("Chasm Crystallized RedPill: Warning: No alternative text found");
        }
        let convertedText = existCheck[0].childNodes[0].childNodes[0];
        if (convertedText.className != unselected.className) {
            convertedText.className = unselected.className;
        }
        return;
      }
      var c = document.querySelectorAll(".css-w5f5cr");
      if (c && c.length > 0) {
        c[0].style.cssText = "max-width: 800px;";
        const d = document.createElement("div");
        // To follow theme color and prevent bugs
        const origin = c[0].childNodes[0];
        const originButton = origin.childNodes[0];
        const originText = originButton.childNodes[0];
        d.className = "red-pill-button " + origin.className;
        d.setAttribute("display", "flex");
        d.innerHTML =
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
        d.addEventListener("click", Z);
        c[0].append(d);
        for (let component of c[0].childNodes) {
          component.style.cssText = "flex-basis: 50px;";
        }
      }
    }
  }
  function O() {
    N();
    let c = location.href;
    new MutationObserver(() => {
      const d = location.href;
      d !== c && ((c = d), N());
    }).observe(document, { subtree: !0, childList: !0 });
    aa(document.body, () => {
      N();
    });
  }
  const aa = (function () {
    const c = window.MutationObserver || window.WebKitMutationObserver;
    return function (d, h) {
      if (d && c) {
        var f = new c((a) => {
          h(a);
        });
        f.observe(d, { childList: !0, subtree: !0, attributes: !0 });
        return f;
      }
    };
  })();
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", O)
    : O();
  window.addEventListener("load", O);
})();
