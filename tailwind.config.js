/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./public/**/*.{html, css, js}", "./src/views/*.ejs", "./src/views/includes/*.ejs", "./src/views/main/*.ejs", "./src/views/auth/*.ejs", "./src/views/admin/*.ejs", "./src/views/admin/auth/*.ejs", "./src/views/admin/includes/*.ejs", "./node_modules/flowbite/**/*.js"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      spacing: {
        '8xl': '96rem',
        '9xl': '128rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  }
}
