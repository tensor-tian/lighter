import type React from "react";

type StringTheme =
  | "dark-plus"
  | "dracula-soft"
  | "dracula"
  | "github-dark"
  | "github-dark-dimmed"
  | "github-light"
  | "light-plus"
  | "material-darker"
  | "material-default"
  | "material-lighter"
  | "material-ocean"
  | "material-palenight"
  | "min-dark"
  | "min-light"
  | "monokai"
  | "nord"
  | "one-dark-pro"
  | "poimandres"
  | "slack-dark"
  | "slack-ochin"
  | "solarized-dark"
  | "solarized-light";

export type Lang =
  | "abap"
  | "actionscript-3"
  | "ada"
  | "apache"
  | "apex"
  | "apl"
  | "applescript"
  | "asm"
  | "astro"
  | "awk"
  | "ballerina"
  | "bash"
  | "bat"
  | "batch"
  | "be"
  | "berry"
  | "bibtex"
  | "bicep"
  | "blade"
  | "c"
  | "c#"
  | "cadence"
  | "cdc"
  | "clarity"
  | "clj"
  | "clojure"
  | "cmake"
  | "cmd"
  | "cobol"
  | "codeql"
  | "coffee"
  | "cpp"
  | "crystal"
  | "csharp"
  | "css"
  | "cue"
  | "d"
  | "dart"
  | "diff"
  | "docker"
  | "dream-maker"
  | "elixir"
  | "elm"
  | "erb"
  | "erl"
  | "erlang"
  | "f#"
  | "fish"
  | "fsharp"
  | "fsl"
  | "gherkin"
  | "git-commit"
  | "git-rebase"
  | "glsl"
  | "gnuplot"
  | "go"
  | "graphql"
  | "groovy"
  | "hack"
  | "haml"
  | "handlebars"
  | "haskell"
  | "hbs"
  | "hcl"
  | "hlsl"
  | "hs"
  | "html"
  | "ini"
  | "jade"
  | "java"
  | "javascript"
  | "jinja-html"
  | "js"
  | "json"
  | "jsonc"
  | "jsonnet"
  | "jssm"
  | "jsx"
  | "julia"
  | "kotlin"
  | "latex"
  | "less"
  | "liquid"
  | "lisp"
  | "logo"
  | "lua"
  | "make"
  | "makefile"
  | "markdown"
  | "marko"
  | "matlab"
  | "md"
  | "mdx"
  | "mermaid"
  | "nginx"
  | "nim"
  | "nix"
  | "objc"
  | "objective-c"
  | "objective-cpp"
  | "ocaml"
  | "pascal"
  | "perl"
  | "perl6"
  | "php"
  | "plsql"
  | "postcss"
  | "powershell"
  | "prisma"
  | "prolog"
  | "ps"
  | "ps1"
  | "pug"
  | "puppet"
  | "purescript"
  | "py"
  | "python"
  | "ql"
  | "r"
  | "raku"
  | "razor"
  | "rb"
  | "rel"
  | "riscv"
  | "rs"
  | "rst"
  | "ruby"
  | "rust"
  | "sas"
  | "sass"
  | "scala"
  | "scheme"
  | "scss"
  | "sh"
  | "shader"
  | "shaderlab"
  | "shell"
  | "shellscript"
  | "smalltalk"
  | "solidity"
  | "sparql"
  | "sql"
  | "ssh-config"
  | "stata"
  | "styl"
  | "stylus"
  | "svelte"
  | "swift"
  | "system-verilog"
  | "tasl"
  | "tcl"
  | "tex"
  | "toml"
  | "ts"
  | "tsx"
  | "turtle"
  | "twig"
  | "typescript"
  | "vb"
  | "verilog"
  | "vhdl"
  | "vim"
  | "viml"
  | "vimscript"
  | "vue"
  | "vue-html"
  | "wasm"
  | "wenyan"
  | "xml"
  | "xsl"
  | "yaml"
  | "zenscript"
  | "zsh"
  | "文言";

export type Token = { style: React.CSSProperties; content: string };

export type Theme = StringTheme | Object;

export const highlight: (
  code: string,
  lang: Lang,
  theme?: Theme
) => Promise<{
  lines: Token[][];
  foreground: string;
  background: string;
  colorScheme: string;
  selectionBackground: string;
  lineNumberForeground: string;
}>;
