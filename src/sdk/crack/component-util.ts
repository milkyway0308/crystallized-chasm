import { SidePanelManager, SidePanelUtil } from "./side-panel-util";

function sidePanel(): SidePanelManager {
  return SidePanelUtil.manager();
}

export const CrackComponentApi = {
  sidePanel,
} as const;
