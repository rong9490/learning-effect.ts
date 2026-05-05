import { describe, it } from '@effect/vitest'
import { assertFalse, assertTrue, deepStrictEqual, strictEqual } from '@effect/vitest/utils'
import { Data, Equal, pipe } from 'effect'

describe('Data', () => {
  it('struct', () => {
    // 创建一个对象数据
    const x = Data.struct({ a: 0, b: 1, c: 2 })
    const y = Data.struct({ a: 0, b: 1, c: 2 })
    const { a, b, c } = x
    strictEqual(a, 0)
    strictEqual(b, 1)
    strictEqual(c, 2)
    assertTrue(Equal.equals(x, y))
    assertFalse(Equal.equals(x, Data.struct({ a: 0 })))

    // different keys length
    assertFalse(Equal.equals(Data.struct({ a: 0, b: 1 }), Data.struct({ a: 0 })))
    // same length but different keys
    assertFalse(Equal.equals(Data.struct({ a: 0 }), Data.struct({ b: 1 })))
  })
})
