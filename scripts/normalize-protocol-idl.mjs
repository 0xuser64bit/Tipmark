import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const path = resolve(process.argv[2] || "target/idl/tipmark_protocol.json");
const idl = JSON.parse(await readFile(path, "utf8"));
const usernameRecord = {
  name: "UsernameRecord",
  discriminator: Array.from(
    createHash("sha256")
      .update("account:UsernameRecord")
      .digest()
      .subarray(0, 8),
  ),
};
const usernameRecordType = {
  name: "UsernameRecord",
  type: {
    kind: "struct",
    fields: [
      { name: "owner", type: "pubkey" },
      { name: "profile", type: "pubkey" },
      { name: "version", type: "u8" },
      { name: "bump", type: "u8" },
      { name: "reserved", type: { array: ["u8", 30] } },
    ],
  },
};

idl.accounts ||= [];
idl.types ||= [];
if (!idl.accounts.some((account) => account.name === usernameRecord.name)) {
  idl.accounts.push(usernameRecord);
}
if (!idl.types.some((type) => type.name === usernameRecordType.name)) {
  idl.types.push(usernameRecordType);
}

await writeFile(path, `${JSON.stringify(idl, null, 2)}\n`);
