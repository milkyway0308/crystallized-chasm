import { PromptDecorationUtil } from "./components/prompt-input-decoration-util";
import { SidePanelManager, SidePanelUtil } from "./components/side-panel-util";
import { CrackMyArticlePage } from "./pages/my-articles-util";

function sidePanel(): SidePanelManager {
  return SidePanelUtil.manager();
}

function articleListing(): typeof CrackMyArticlePage {
  return CrackMyArticlePage;
}

function promptInputDecoration(): typeof PromptDecorationUtil {
  return PromptDecorationUtil;
}

export const CrackComponentApi = {
  sidePanel,
  articleListing,
  promptInputDecoration,
} as const;
