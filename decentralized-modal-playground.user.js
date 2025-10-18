// ==UserScript==
// @name        Decentrailized Modal Playground
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     1.0.0
// @description decentralized-modal.js 테스트 유저스크립트
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/decentralized-modal-playground.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/decentralized-modal-playground.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@218ec165592a217cd16428075af22e87cf3dc664/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==

!(function () {
  const manager = ModalManager.getOrCreateManager("test");
  manager
    .createMenu("C2 Burner+", (modal) => {
      modal.replaceContentPanel(
        (panel) => {
          panel.addInputGrid("Test", "Hello, World!", (action) => {});
          panel.addLongInputGrid("Test2", "Hello, World!", (action) => {});
          panel.addInputGrid("Test3", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addLongInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addInputGrid("Test4", "Hello, World!", (action) => {});
          panel.addTextAreaGrid("test13", "Type text here", (action) => {});
          panel
            .footer()
            .addLoggingArea("logs", "Logs", (action) => {})
            .addSwitchGrid(
              "test188",
              "Hello",
              "This is test switch.\nAnd this is multilined.\n Not bad, isn't it?\nI'm writing here to test something long, long text render, so it can move down. Can it be fixed with switch?",
              () => {}
            )
            .addButton("test-button", "Hello, World!");
        },
        "C2 Burner+",
        DECENTRAL_DEFAULT_ICON_SVG
      );
      return true;
    })
    .createSubMenu("Test submenu 1", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addTitleText("Hello world");
      }, "Test submenu 1");
    })
    .createSubMenu("Test submenu 2", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addTitleText("Hello world!");
      }, "Test submenu 2");
    });
  manager
    .createMenu("C2 Ignitor", (modal) => {})
    .createSubMenu("Test Menu", (modal) => {});
  manager.addLicenseDisplay((panel) => {
    panel
      .addTitleText("Decentralized Modal Playground")
      .addText("이 테스트 스크립트에는 추가적으로 표기될 라이선스가 없습니다.");
  });

  document.testModal = () => {
    const testManager = ModalManager.getOrCreateManager("test");
    testManager.withLicenseCredential().display(true);
  };
})();
