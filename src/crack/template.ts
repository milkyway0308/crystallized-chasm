
import { ScriptMetaUtil } from "../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "template.user.js", undefined, (meta) => {
  meta.name = "Test Template";
  meta.version = "v1.0.0";
});

test();

function test() {
  console.log("Hello, Crystallized Chasm!")
}