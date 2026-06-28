export default defineNuxtPlugin(() => {
  const uaPlatform =
    (navigator as any).userAgentData?.platform ||
    navigator.platform ||
    ''

  const isWindows = /win/i.test(uaPlatform)

  document.documentElement.classList.toggle('is-windows', isWindows)
})