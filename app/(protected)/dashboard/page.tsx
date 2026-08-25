import { getEarningData } from "@/actions/getEarningData";
import { getSolPrice } from "@/actions/getSolPrice";
import getUserByEmail from "@/actions/getUserByEmail";
import { AccountMenu } from "@/components/account-menu";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Statement } from "@/components/statement";
import { auth } from "@/lib/auth";
import { getProtocolConfig } from "@/lib/protocol/config";
import { resolveOnChainProfile } from "@/lib/protocol/public-profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Ledger" };

export default async function LedgerPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const user = await getUserByEmail({ email });
  const protocol = getProtocolConfig();
  const onChain =
    protocol.enabled && user?.username
      ? await resolveOnChainProfile(user.username).catch(() => null)
      : null;
  if (protocol.enabled && !onChain) redirect("/edit-profile");
  const [data, priceUsd] = await Promise.all([
    getEarningData({ userId: email, profileAddress: onChain?.address }),
    getSolPrice(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav actions={<AccountMenu />} />
      <Statement
        data={data}
        priceUsd={priceUsd}
        username={user?.username?.toLowerCase() ?? null}
        displayName={user?.display_name ?? "Your page"}
        profileImage={user?.profile_image ?? ""}
      />
      <SiteFooter />
    </div>
  );
}
