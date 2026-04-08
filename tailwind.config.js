/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                card: "var(--card)",
                text: "var(--text)",
                primary: "var(--primary)",
                accent: "var(--accent)",
            },
        },
    },
};
