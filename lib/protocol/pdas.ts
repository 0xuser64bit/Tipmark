import { address, type Address, type ProgramDerivedAddress } from "@solana/kit";
import {
  findConfigPda,
  findProfilePda,
  findUsernameRecordPda,
} from "@/clients/tipmark-protocol/src";
import { getProtocolConfig } from "./config";
import { parseProtocolUsername } from "./username";

export function deriveConfigPda(): Promise<ProgramDerivedAddress> {
  return findConfigPda({ programAddress: getProtocolConfig().programAddress });
}

export function deriveProfilePda(
  owner: string | Address,
  programAddress = getProtocolConfig().programAddress,
): Promise<ProgramDerivedAddress> {
  return findProfilePda({ owner: address(owner) }, { programAddress });
}

export function deriveUsernamePda(
  username: string,
  programAddress = getProtocolConfig().programAddress,
): Promise<ProgramDerivedAddress> {
  return findUsernameRecordPda(
    { username: parseProtocolUsername(username) },
    { programAddress },
  );
}
