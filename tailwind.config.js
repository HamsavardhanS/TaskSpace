/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    light: '#818cf8',
                    DEFAULT: '#595cd9',
                    dark: '#4338ca',
                },
                surface: {
                    light: '#ffffff',
                    dark: '#1e1e2d',
                    darker: '#151521'
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    dark: 'rgba(30, 30, 45, 0.7)',
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'neumorph': '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
                'neumorph-dark': '20px 20px 60px #1a1a26, -20px -20px 60px #222234',
            },
            animation: {
                blob: "blob 7s infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
