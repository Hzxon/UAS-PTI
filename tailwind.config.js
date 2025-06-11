/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // If you have a root index.html for Vite/CRA
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS, TS, JSX, TSX files in the src folder
  ],
  theme: {
    extend: {
      fontFamily: {
        // These names 'judul' and 'utama' can be anything you choose.
        // You'll use them in your Tailwind classes like `font-judul` or `font-utama`.
        'judul': ['Judul Tampilan Awal', 'sans-serif'], //
        'utama': ['Font Utama', 'sans-serif'],       //
      },
      animation: {
        blink: 'blink 1.5s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      // You can extend other theme properties here if needed:
      // colors: {
      //   'custom-yellow': '#ffcf40', //
      //   'custom-orange': '#ff9d00', //
      // },
      // keyframes: { // For custom animations like blink
      //   blink: {
      //     '0%, 100%': { opacity: '1' },
      //     '50%': { opacity: '0' },
      //   }
      // },
      // animation: {
      //   blink: 'blink 3s infinite', //
      // }
    },
  },
  plugins: [],
}