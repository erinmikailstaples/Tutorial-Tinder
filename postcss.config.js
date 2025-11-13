export default (ctx) => ({
  parser: ctx.parser ? ctx.parser : false,
  map: ctx.env === 'development' ? ctx.map : false,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
})
