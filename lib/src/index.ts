import {
  Annotation,
  AnnotationExtractor,
  extractCommentsFromCode,
} from "./comments";
import { LANG_NAMES, LanguageAlias, LanguageName } from "./language-data";
import {
  Line,
  LineGroup,
  Lines,
  Token,
  TokenGroup,
  Tokens,
  applyAnnotations,
} from "./annotations";
import {
  RawTheme,
  StringTheme,
  THEME_NAMES,
  Theme,
  UnknownThemeError,
  getAllThemeColors,
  getTheme,
  preloadTheme,
} from "./theme";
import {
  UnknownLanguageError,
  getGrammar,
  highlightText,
  highlightTokens,
  highlightTokensWithScopes,
  preloadGrammars,
} from "./highlighter";
import { getTerminalStyle, highlightTerminal } from "./terminal";

type Config = { scopes?: boolean };
type AnnotatedConfig = { annotations: Annotation[] } & Config;
type LighterResult = {
  lines: Token[][];
  lang: LanguageName;
  style: {
    color: string;
    background: string;
  };
};
type AnnotatedLighterResult = {
  lines: Lines;
  lang: LanguageName;
  style: {
    color: string;
    background: string;
  };
};

export { UnknownLanguageError, UnknownThemeError, THEME_NAMES, LANG_NAMES };

export type {
  LanguageAlias,
  Theme,
  StringTheme,
  RawTheme,
  Annotation,
  Lines,
  LineGroup,
  Line,
  TokenGroup,
  Tokens,
  Token,
  LighterResult,
  AnnotatedLighterResult,
};

function isAnnotatedConfig(
  config: Config | AnnotatedConfig
): config is AnnotatedConfig {
  return "annotations" in config;
}

export async function preload(langs: LanguageAlias[], theme?: Theme) {
  await Promise.all([preloadGrammars(langs), preloadTheme(theme)]);
}

export async function highlight(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName?: Theme,
  config?: Config
): Promise<LighterResult>;
export async function highlight(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName: Theme,
  config: AnnotatedConfig
): Promise<AnnotatedLighterResult>;
export async function highlight(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName: Theme = "dark-plus",
  config: Config | AnnotatedConfig = {}
) {
  const theCode = code || "";
  const theLang = lang || "text";

  if (typeof theCode !== "string") {
    throw new Error("Syntax highlighter error: code must be a string");
  }
  if (typeof theLang !== "string") {
    throw new Error("Syntax highlighter error: lang must be a string");
  }

  await preload([theLang], themeOrThemeName);
  return highlightSync(theCode, theLang, themeOrThemeName, config) as any;
}
export function highlightSync(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName?: Theme,
  config?: Config
): LighterResult;
export function highlightSync(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName: Theme,
  config: AnnotatedConfig
): AnnotatedLighterResult;
export function highlightSync(
  code: string,
  lang: LanguageAlias,
  themeOrThemeName: Theme = "dark-plus",
  config: Config | AnnotatedConfig = {}
) {
  const theCode = code || "";
  const theLang = lang || "text";

  if (typeof theCode !== "string") {
    throw new Error("Syntax highlighter error: code must be a string");
  }
  if (typeof theLang !== "string") {
    throw new Error("Syntax highlighter error: lang must be a string");
  }

  const { langId, grammar } = getGrammar(theLang);
  const theme = getTheme(themeOrThemeName);

  const lines =
    langId == "text"
      ? highlightText(theCode)
      : langId == "terminal"
      ? highlightTerminal(theCode, theme)
      : config?.scopes
      ? highlightTokensWithScopes(theCode, grammar, theme)
      : highlightTokens(theCode, grammar, theme);

  const style =
    langId == "terminal"
      ? getTerminalStyle(theme)
      : {
          color: theme.foreground,
          background: theme.background,
        };

  if (isAnnotatedConfig(config)) {
    const annotations = config?.annotations || [];
    return {
      lines: applyAnnotations(lines, annotations),
      lang: langId,
      style,
    };
  } else {
    return {
      lines: lines,
      lang: langId,
      style,
    };
  }
}

export async function extractAnnotations(
  code: string,
  lang: LanguageAlias,
  lineNums?: string,
  annotationExtractor?: AnnotationExtractor
) {
  if (!annotationExtractor) {
    return { code, annotations: [] };
  }

  await preloadGrammars([lang]);
  const { grammar } = getGrammar(lang);

  const { newCode, annotations, lineCount } = extractCommentsFromCode(
    code,
    grammar,
    lang,
    lineNums,
    annotationExtractor
  );

  return {
    code: newCode,
    annotations,
    lineNums: lineNums ? lineNums : `1:${lineCount}`,
  };
}

export async function getThemeColors(themeOrThemeName: Theme) {
  if (!themeOrThemeName) {
    throw new Error("Syntax highlighter error: undefined theme");
  }

  await preload([], themeOrThemeName);
  const theme = getTheme(themeOrThemeName);
  return getAllThemeColors(theme);
}

export function getThemeColorsSync(themeOrThemeName: Theme) {
  if (!themeOrThemeName) {
    throw new Error("Syntax highlighter error: undefined theme");
  }
  const theme = getTheme(themeOrThemeName);
  return getAllThemeColors(theme);
}

export type LighterColors = ReturnType<typeof getThemeColors>;
