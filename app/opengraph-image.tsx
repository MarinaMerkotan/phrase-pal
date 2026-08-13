import { ImageResponse } from "next/og";

export const alt = "Phrase Pal — Learn words. Speak with confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#081426",
        color: "#f5f9ff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.45,
          backgroundImage:
            "linear-gradient(rgba(113,190,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,190,255,.08) 1px, transparent 1px), radial-gradient(circle at 82% 44%, rgba(53,155,255,.36), transparent 31%)",
          backgroundSize: "64px 64px, 64px 64px, auto",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          right: -20,
          top: 54,
          display: "flex",
          borderRadius: 260,
          background: "radial-gradient(circle, rgba(99,190,255,.18), rgba(8,20,38,0) 68%)",
        }}
      />

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "68px 72px 64px 78px",
        }}
      >
        <div
          style={{
            width: 670,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
            <div
              style={{
                width: 54,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                border: "1px solid rgba(159,220,255,.7)",
                borderRadius: 16,
                background: "linear-gradient(145deg, #8ed9ff, #3da9f5)",
                boxShadow: "0 10px 30px rgba(43,159,255,.3)",
              }}
            >
              <div style={{ width: 15, height: 23, display: "flex", borderRadius: "5px 2px 2px 5px", background: "#0b284c", transform: "rotate(5deg)" }} />
              <div style={{ width: 15, height: 23, display: "flex", borderRadius: "2px 5px 5px 2px", background: "#0b284c", transform: "rotate(-5deg)" }} />
            </div>
            <div style={{ display: "flex", fontSize: 29, fontWeight: 750, letterSpacing: -1 }}>Phrase Pal</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                color: "#69bdff",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Vocabulary that sticks
            </div>
            <div style={{ display: "flex", marginTop: 17, fontSize: 72, fontWeight: 750, lineHeight: 1.02, letterSpacing: -3 }}>
              Learn words.
            </div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 750, lineHeight: 1.02, letterSpacing: -3, color: "#7ac7ff" }}>
              Speak with confidence.
            </div>
            <div style={{ display: "flex", marginTop: 23, color: "#91a2b8", fontSize: 22 }}>
              Focused flashcards, pronunciation practice and progress tracking.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#61748c", fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>
            <div style={{ display: "flex" }}>Flashcards</div>
            <div style={{ display: "flex", color: "#36506c" }}>·</div>
            <div style={{ display: "flex" }}>Practice</div>
            <div style={{ display: "flex", color: "#36506c" }}>·</div>
            <div style={{ display: "flex" }}>Progress</div>
          </div>
        </div>

        <div
          style={{
            width: 336,
            height: 410,
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 278,
              height: 348,
              right: 3,
              top: 34,
              display: "flex",
              border: "1px solid rgba(111,194,255,.42)",
              borderRadius: 32,
              background: "rgba(14,45,79,.7)",
              transform: "rotate(8deg)",
            }}
          />
          <div
            style={{
              width: 286,
              height: 358,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(143,211,255,.65)",
              borderRadius: 32,
              background: "linear-gradient(145deg, rgba(30,76,122,.96), rgba(11,31,56,.98))",
              boxShadow: "0 28px 80px rgba(26,145,255,.28)",
              transform: "rotate(-4deg)",
            }}
          >
            <div style={{ display: "flex", color: "#75c7ff", fontSize: 14, letterSpacing: 3, textTransform: "uppercase" }}>English</div>
            <div style={{ display: "flex", marginTop: 34, fontSize: 43, fontWeight: 750, letterSpacing: -1 }}>confident</div>
            <div style={{ width: 58, height: 2, display: "flex", marginTop: 25, background: "#4e87b7" }} />
            <div style={{ display: "flex", marginTop: 25, color: "#c6e7ff", fontSize: 24 }}>впевнений</div>
            <div style={{ display: "flex", marginTop: 52, color: "#6f8ba7", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>Tap to flip</div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
