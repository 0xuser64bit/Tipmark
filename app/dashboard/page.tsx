import { CreatorLedger } from "@/components/creator-ledger";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";

export const metadata = { title: "Ledger" };

export default function LedgerPage() {
  return (
    <WalletAdapterWrapper>
      <CreatorLedger />
    </WalletAdapterWrapper>
  );
}
