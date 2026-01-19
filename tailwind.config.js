export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8BC34A',
                'primary-dark': '#689F38',
                'text-primary': '#2D2D2D',
                'text-secondary': '#6B6B6B',
                'neutral-100': '#F5F5F5',
                'neutral-200': '#E5E5E5',
                'neutral-500': '#737373',
                'cream-100': '#F9FFF5',
            },
            borderRadius: {
                'card': '20px',
            },
        },
    },
    plugins: [],
}
