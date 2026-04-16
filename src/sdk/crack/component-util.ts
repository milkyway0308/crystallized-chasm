import { SidePanelManager, SidePanelUtil } from "./components/side-panel-util";

function sidePanel(): SidePanelManager {
  return SidePanelUtil.manager();
}

export const CrackComponentApi = {
  sidePanel,
} as const;
