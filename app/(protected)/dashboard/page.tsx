import { getEarningData } from "@/actions/getEarningData";
import { getSolPrice } from "@/actions/getSolPrice";
import getUserByEmail from "@/actions/getUserByEmail";
import { AccountMenu } from "@/components/account-menu";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Statement } from "@/components/statement";
import { auth } from "@/lib/auth";
import { metadataGatewayUrl, resolveOnChainProfile } from "@/lib/protocol/public-profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Ledger" };

export default async function LedgerPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const user = await getUserByEmail({ email });
  const onChain = user?.username
    ? await resolveOnChainProfile(user.username).catch(() => null)
    : null;
  if (!onChain) redirect("/edit-profile");

  const [data, priceUsd] = await Promise.all([
    getEarningData({ profileAddress: onChain.address }),
    getSolPrice(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav actions={<AccountMenu />} />
      <Statement
        data={data}
        priceUsd={priceUsd}
        username={onChain.username}
        displayName={onChain.metadata.displayName}
        profileImage={
          onChain.metadata.images.avatar
            ? metadataGatewayUrl(onChain.metadata.images.avatar)
            : ""
        }
      />
      <SiteFooter />
    </div>
  );
}
