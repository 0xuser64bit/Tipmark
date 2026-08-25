import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createFromRoot } from "codama";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import renderJavaScriptVisitor from "@codama/renderers-js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const idlPath = resolve(root, "idls/tipmark_protocol.json");
const clientPath = resolve(root, "clients/tipmark-protocol");
const idl = JSON.parse(await readFile(idlPath, "utf8"));

const codama = createFromRoot(rootNodeFromAnchor(idl));

await codama.accept(
  renderJavaScriptVisitor(clientPath, {
    formatCode: true,
    kitImportStrategy: "preferRoot",
    syncPackageJson: false,
  }),
);
