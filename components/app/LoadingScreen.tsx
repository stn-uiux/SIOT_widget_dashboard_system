import React from "react";

/** Full-screen loading overlay (design tokens only). */
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-[var(--loading-bg)] flex items-center justify-center" style={{ zIndex: "var(--loading-z)" }}>
    <div className="relative flex flex-col items-center">
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          inset: "var(--loading-glow-inset-outer)",
          backgroundColor: "var(--loading-glow-1)",
          filter: "blur(var(--loading-blur-1))",
        }}
      />
      <div
        className="absolute rounded-full animate-pulse [animation-delay:700ms]"
        style={{
          inset: "var(--loading-glow-inset-inner)",
          backgroundColor: "var(--loading-glow-2)",
          filter: "blur(var(--loading-blur-2))",
        }}
      />
      <div className="flex flex-col items-center">
        <div
          className="rounded-full animate-spin"
          style={{
            width: "var(--loading-spinner-size)",
            height: "var(--loading-spinner-size)",
            borderWidth: "var(--loading-spinner-border-width)",
            marginBottom: "var(--spacing-xl)",
            borderColor: "var(--loading-spinner-track)",
            borderTopColor: "var(--loading-spinner-color)",
          }}
        />
        <div className="text-center">
          <span
            className="uppercase tracking-[0.4em] font-black animate-pulse"
            style={{ fontSize: "var(--text-small)", color: "var(--loading-text-1)" }}
          >
            STN Dashboard
          </span>
          <p
            className="tracking-widest uppercase"
            style={{ marginTop: "var(--spacing-xs)", fontSize: "var(--text-tiny)", color: "var(--loading-text-2)" }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingScreen;
