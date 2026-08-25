import { getSolPrice } from "@/actions/getSolPrice";
import { Landing } from "@/components/landing";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  /* Signed-in creators have no use for the pitch — send them to their page
     on the server so they never see it flash. */
  const session = await auth();
  if (session?.user) redirect("/home");

  /* The receipt specimen quotes a real rate rather than inventing one. */
  const priceUsd = await getSolPrice();

  return <Landing priceUsd={priceUsd} />;
}
