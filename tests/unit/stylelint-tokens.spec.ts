// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'

const configFile = fileURLToPath(new URL('../../stylelint.config.js', import.meta.url))
const tokensFile = fileURLToPath(new URL('../../src/shared/styles/tokens.css', import.meta.url))

async function ruleIds(code: string, codeFilename = 'src/example.css'): Promise<string[]> {
  const result = await stylelint.lint({ code, codeFilename, configFile })
  return (result.results[0]?.warnings ?? []).map((w) => w.rule)
}

describe('stylelint の色の直接指定の禁止', () => {
  it.each([
    ['16進カラー', '.a { color: #18201c; }\n', 'color-no-hex'],
    ['名前付き色', '.a { color: red; }\n', 'color-named'],
    ['色関数', '.a { color: rgb(0 0 0); }\n', 'function-disallowed-list'],
  ])('%s を拒否する', async (_label, code, rule) => {
    expect(await ruleIds(code)).toContain(rule)
  })

  it('tokens.css の CSS 変数を使う指定は許可する', async () => {
    expect(await ruleIds('.a {\n  color: var(--color-text);\n}\n')).toEqual([])
  })

  it('.vue ファイルの style でも拒否する', async () => {
    const code =
      '<template><p class="a" /></template>\n<style scoped>\n.a { color: #fff; }\n</style>\n'
    expect(await ruleIds(code, 'src/Example.vue')).toContain('color-no-hex')
  })

  it('tokens.css 自身は16進カラーを定義できる', async () => {
    const code = await readFile(tokensFile, 'utf8')
    expect(await ruleIds(code, tokensFile)).toEqual([])
  })
})
