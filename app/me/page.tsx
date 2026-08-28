import { OwnedProfile } from "@/components/owned-profile-page";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";

export const metadata = { title: "My page" };

export default function MyPage() {
  return (
    <WalletAdapterWrapper>
      <OwnedProfile />
    </WalletAdapterWrapper>
  );
}
