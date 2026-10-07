// Type shim: allows TypeScript to import *.html files as plain strings.
// esbuild handles the actual inlining at build time via --loader:.html=text
declare module '*.html' {
  const content: string;
  export default content;
}
