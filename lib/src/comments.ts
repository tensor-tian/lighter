import { CodeRange, parseRelativeRanges } from "./range";
import { highlightText, highlightTokens } from "./highlighter";

import { FinalTheme } from "./theme";
import type { IGrammar } from "vscode-textmate";
import { Token } from "./annotations";

const PUNCTUATION = "#001";
const COMMENT = "#010";
const LINE_COMMENT = "#011";
const BLOCK_COMMENT = "#012";
const commentsTheme: FinalTheme = {
  name: "comments",
  type: "light",
  foreground: "",
  background: "",
  colors: {},
  settings: [
    { settings: { foreground: "#000" } },
    {
      scope: ["punctuation.definition.comment"],
      settings: { foreground: PUNCTUATION },
    },
    { scope: "comment", settings: { foreground: COMMENT } },
    // { scope: "comment.line", settings: { foreground: LINE_COMMENT } },
    // { scope: "comment.block", settings: { foreground: BLOCK_COMMENT } },
  ],
};

export type Annotation = {
  name: string;
  query?: string;
  ranges: CodeRange[];
};

export type AnnotationData = {
  name: string;
  rangeString: string;
  query?: string;
};

export type AnnotationExtractor =
  | string[]
  | ((comment: string) => null | AnnotationData);

export function extractCommentsFromCode(
  code: string,
  grammar: IGrammar,
  lang: string,
  lineNums: string | null,
  annotationExtractor: AnnotationExtractor
) {
  const lines = !grammar
    ? highlightText(code)
    : highlightTokens(code, grammar, commentsTheme);

  const allAnnotations: Annotation[] = [];

  const cursor = new LineNumsCursor(
    typeof lineNums === "string" && lineNums.length > 0
      ? lineNums
      : `1:${lines.length}`
  );
  const newLines = lines
    .map((line) => {
      const { annotations, lineWithoutComments } = getAnnotationsFromLine(
        line,
        annotationExtractor,
        cursor.getValue()
      );

      allAnnotations.push(...annotations);

      if (!lineWithoutComments) {
        return null;
      }

      const lineText = lineWithoutComments.map((t) => t.content).join("");

      // remove jsx comment wrapper https://github.com/code-hike/lighter/issues/23
      if (
        ["mdx", "jsx", "tsx"].includes(lang) &&
        annotations.length > 0 &&
        lineText.trim() === "{}"
      ) {
        return null;
      }
      cursor.next();

      return lineText;
    })
    .filter((line) => line !== null);

  return {
    newCode: newLines.join("\n"),
    annotations: allAnnotations,
    lineCount: newLines.length,
  };
}

class LineNumsCursor {
  ranges: [number, number][];
  cursor: [number, number];
  constructor(rangeStr: string) {
    this.ranges = rangeStr
      .split(",")
      .reduce((acc, part) => {
        const range = part.split(":");
        const from = Number(range[0]);
        const to = range[1] ? Number(range[1]) : from;
        acc.push([from, to]);
        return acc;
      }, [])
      .sort((a, b) => a[0] - b[0]);
    // from file annotatton will append an empty line
    this.ranges[this.ranges.length - 1][1]++;
    this.cursor = [0, 0];
  }
  public getValue(): number {
    const [i, j] = this.cursor;
    return this.ranges[i][0] + j;
  }
  public next() {
    const [i, j] = this.cursor;
    if (this.getValue() === this.ranges[i][1]) {
      this.cursor[0] = i + 1;
      this.cursor[1] = 0;
    } else {
      this.cursor[1] = j + 1;
    }
  }
}

function getAnnotationsFromLine(
  tokens: Token[],
  annotationExtractor: AnnotationExtractor,
  lineNumber: number
) {
  // if no punctuation return empty
  if (!tokens.some((token) => token.style.color === PUNCTUATION)) {
    return { annotations: [], lineWithoutComments: tokens };
  }

  // first get the annotations without touching the line
  const comments: {
    tokens: Token[];
    name: string;
    query?: string;
    ranges: CodeRange[];
  }[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.style.color !== COMMENT) {
      // not a comment
      i++;
      continue;
    }

    const annotationData =
      typeof annotationExtractor === "function"
        ? annotationExtractor(token.content)
        : getAnnotationDataFromNames(token.content, annotationExtractor);

    if (!annotationData) {
      // a comment, but not an annotation
      i++;
      continue;
    }
    const { name, query, rangeString } = annotationData;

    // we have an annotation
    const prevToken = tokens[i - 1];
    const nextToken = tokens[i + 1];
    const commentTokens: Token[] = [];
    if (prevToken && prevToken.style.color === PUNCTUATION) {
      commentTokens.push(prevToken);
    }
    commentTokens.push(token);
    if (nextToken && nextToken.style.color === PUNCTUATION) {
      commentTokens.push(nextToken);
    }

    comments.push({
      tokens: commentTokens,
      name,
      query,
      ranges: parseRelativeRanges(rangeString, lineNumber),
    });

    i += 2;
  }

  // remove the comments from the line
  let newLine = tokens;
  for (const comment of comments) {
    newLine = newLine.filter((token) => !comment.tokens.includes(token));
  }

  // if the newLine is whitespace, set it to null
  if (newLine.every((token) => token.content.trim() === "")) {
    newLine = null;
  }

  return {
    annotations: comments.map((a) => ({
      name: a.name,
      query: a.query,
      ranges: a.ranges,
    })),
    lineWithoutComments: newLine,
  };
}

function getAnnotationDataFromNames(content: string, names: string[]) {
  const regex = /\s*([\w-]+)?(\([^\)]*\)|\[[^\]]*\])?(.*)$/;
  const match = content.match(regex);
  const name = match[1];
  const rangeString = match[2];
  const query = match[3]?.trim();

  if (!names.includes(name)) {
    return null;
  }

  return { name, rangeString, query };
}
