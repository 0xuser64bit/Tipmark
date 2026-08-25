import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/lib/brand";

export const alt = "Tipmark — direct creator support with verifiable receipts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f5f1e8",
          color: "#17150f",
          display: "flex",
          height: "100%",
          padding: "88px 100px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#14573c",
            clipPath:
              "polygon(0 0,100% 0,100% 88%,87.5% 100%,75% 88%,62.5% 100%,50% 88%,37.5% 100%,25% 88%,12.5% 100%,0 88%)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            height: 300,
            justifyContent: "center",
            marginRight: 56,
            padding: "0 28px",
            width: 82,
          }}
        >
          <div style={{ background: "#faf8f4", height: 8, width: 26 }} />
          <div style={{ background: "#faf8f4", height: 8, width: 46 }} />
          <div style={{ background: "#faf8f4", height: 8, width: 34 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 106,
              fontWeight: 600,
              letterSpacing: -5,
            }}
          >
            {BRAND_NAME}
          </div>
          <div
            style={{
              color: "#6f685c",
              display: "flex",
              fontFamily: "monospace",
              fontSize: 26,
              letterSpacing: 3,
              marginTop: 22,
              textTransform: "uppercase",
            }}
          >
            Direct support · verifiable receipts
          </div>
          <div
            style={{
              borderTop: "2px solid #d8d0c0",
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 34,
              lineHeight: 1.4,
              marginTop: 52,
              paddingTop: 28,
            }}
          >
            Wallet to wallet. No platform cut. Every transfer on record.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
