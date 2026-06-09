import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f1ea",
        ink: "#29231f",
        moss: "#506a55",
        gum: "#c85f46",
        notice: "#f5d36b"
      },
      boxShadow: {
        card: "0 12px 30px rgba(41, 35, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
