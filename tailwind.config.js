// Build: npx tailwindcss@3.4.17 -c tailwind.config.js -i css/input.css -o css/app.css --minify
// then keep the licence banner on line 1 of css/app.css (see THIRD-PARTY-NOTICES.md)
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
