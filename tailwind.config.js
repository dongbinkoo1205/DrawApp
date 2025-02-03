/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            height: {
                '70p': '70%', // 70% 높이 추가
            },
            
        },
    },
    plugins: [
        require('@tailwindcss/forms'), // 🔹 이 플러그인도 함께 확인
        require('@tailwindcss/typography'), // ✅ 여기에 typography 플러그인 추가
    ],
};
