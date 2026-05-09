import type { Config } from "tailwindcss";

const config: Config = {
    content: [
          "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
    darkMode: ["class"],
    theme: {
          extend: {
                  colors: {
                            background: "var(--background)",
                            foreground: "var(--foreground)",
                            terminal: {
                                        black: "#000000",
                                        dark: "#0a0a0a",
                                        green: "var(--accent)",
                                        red: "var(--red)",
                                        yellow: "var(--yellow)",
                                        parchment: "#f4f4f0",
                                        ink: "#202020",
                                        accent: "var(--accent)",
                            },
                  },
                  fontFamily: {
                            mono: ["var(--font-mono)", "JetBrains Mono", "Space Mono", "monospace"],
                  },
                  animation: {
                            blink: "blink 1s step-end infinite",
                  },
                  keyframes: {
                            blink: {
                                        "0%, 100%": { opacity: "1" },
                                        "50%": { opacity: "0" },
                            },
                  },
          },
    },
    plugins: [],
};
export default config;
