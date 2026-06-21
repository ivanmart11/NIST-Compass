import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NIST Compass brand palette
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec0ff",
          400: "#599dff",
          500: "#3377f5",
          600: "#1f59db",
          700: "#1a47b1",
          800: "#1b3d8c",
          900: "#1b376f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
