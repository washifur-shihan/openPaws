import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF7ED",
        honey: "#F59E0B",
        cocoa: "#422006",
        moss: "#365314",
        rosepetal: "#FFF1F2"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(66,32,6,.12)",
        glow: "0 18px 60px rgba(245,158,11,.25)"
      },
      borderRadius: {
        '3xl': '1.75rem'
      }
    }
  },
  plugins: []
};

export default config;
