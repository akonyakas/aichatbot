// global.d.ts
export {}

declare global {
  interface Window {
    Prism: {
      highlightAll: () => void
      // add other Prism methods you use here…
    }
  }
}