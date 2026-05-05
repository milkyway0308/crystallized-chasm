import { MyArticlesMenuDropDownApi } from "../components/builder-dropdown-util";

function popup(): typeof MyArticlesMenuDropDownApi {
  return MyArticlesMenuDropDownApi;
}

export const CrackMyArticlePage = {
    popup
} as const;
