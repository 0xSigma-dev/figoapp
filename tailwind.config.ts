import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{css,scss}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#8c52ff',
        'secondary': '#D602F0',
        'gradient-start': '#8c52ff',
        'gradient-end': '#5ce1e6',
      },
      backgroundColor: {
        'white':'#F7F7F7',
        'black': '#100113',
        'deep-purple': '#100113'
      },
    },
  },
  plugins: [],
};

export default config;

