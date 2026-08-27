import { getSolPrice } from "@/actions/getSolPrice";
import { Landing } from "@/components/landing";

export default async function HomePage() {
  /* The receipt specimen quotes a real rate rather than inventing one. */
  const priceUsd = await getSolPrice();

  return <Landing priceUsd={priceUsd} />;
}
