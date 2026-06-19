import React from "react";

export function NProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: linear-gradient(90deg, #9945ff, #14f195);
          position: fixed;
          z-index: 1031;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow:
            0 0 10px #9945ff,
            0 0 5px #14f195;
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>
      {children}
    </>
  );
}
