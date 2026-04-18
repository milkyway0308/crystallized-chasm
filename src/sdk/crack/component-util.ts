import { SidePanelManager, SidePanelUtil } from "./components/side-panel-util";
import { CrackMyArticlePage } from "./pages/my-articles-util";

function sidePanel(): SidePanelManager {
  return SidePanelUtil.manager();
}

function myArticles(): typeof CrackMyArticlePage {
  return CrackMyArticlePage;
}

export const CrackComponentApi = {
  sidePanel,
  articleListing: myArticles,
} as const;
