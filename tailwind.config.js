// Build: npx tailwindcss@3.4.17 -c tailwind.config.js -i css/input.css -o css/app.css --minify
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        workshop: { 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
      },
    },
  },
};
