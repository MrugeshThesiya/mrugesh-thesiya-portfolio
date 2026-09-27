/**
 * A deliberately small tokeniser. Syntax highlighting here is a matter of
 * brightness, not hue — comments recede, keywords and literals come forward.
 */

export type TokenKind = 'comment' | 'keyword' | 'string' | 'number' | 'type' | 'plain' | 'punct'

export interface Token {
  text: string
  kind: TokenKind
}

const TS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'finally', 'for', 'from',
  'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'of',
  'private', 'public', 'protected', 'readonly', 'return', 'satisfies', 'static', 'super',
  'switch', 'this', 'throw', 'try', 'type', 'typeof', 'var', 'void', 'while', 'yield', 'true',
  'false', 'null', 'undefined',
])

const HDL_KEYWORDS = new Set([
  'CHIP', 'IN', 'OUT', 'INOUT', 'CLOCKED', 'BUFFER', 'WIRE', 'NAND', 'NOR', 'AND', 'OR', 'NOT',
  'XOR', 'MUX', 'DMUX', 'IF', 'ELSE', 'TRUE', 'FALSE', 'HALT', 'JMP', 'JEQ', 'JGT', 'JLT', 'JGE',
  'JLE', 'JNE', 'ADD', 'SUB', 'MUL', 'DIV', 'NEG', 'NOT', 'EQ', 'LT', 'GT', 'LE', 'GE', 'SCREEN',
  'KEYBOARD', 'MEMORY', 'CPU', 'COMPUTER',
])

const SCANNER =
  /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(?<number>\b\d+(?:\.\d+)?\b)|(?<word>[A-Za-z_$][\w$]*)|(?<punct>[^\w\s])/g

export const TOKEN_CLASS: Record<TokenKind, string> = {
  comment: 'text-dim italic',
  keyword: 'text-ink',
  string: 'text-ink',
  number: 'text-muted',
  type: 'text-ink',
  plain: 'text-muted',
  punct: 'text-dim',
}

export function tokenize(source: string, language: 'ts' | 'hdl'): Token[] {
  const keywords = language === 'ts' ? TS_KEYWORDS : HDL_KEYWORDS
  const tokens: Token[] = []
  let cursor = 0

  const push = (text: string, kind: TokenKind) => {
    if (text) tokens.push({ text, kind })
  }

  for (const match of source.matchAll(SCANNER)) {
    const start = match.index ?? 0
    push(source.slice(cursor, start), 'plain')

    const groups = match.groups ?? {}
    if (groups.comment !== undefined) push(groups.comment, 'comment')
    else if (groups.string !== undefined) push(groups.string, 'string')
    else if (groups.number !== undefined) push(groups.number, 'number')
    else if (groups.word !== undefined) {
      if (keywords.has(groups.word)) push(groups.word, 'keyword')
      else if (/^[A-Z]/.test(groups.word)) push(groups.word, 'type')
      else push(groups.word, 'plain')
    } else if (groups.punct !== undefined) push(groups.punct, 'punct')

    cursor = start + match[0].length
  }

  push(source.slice(cursor), 'plain')
  return tokens
}
