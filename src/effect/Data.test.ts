import { describe, it } from '@effect/vitest'
import { assertFalse, assertTrue, deepStrictEqual, strictEqual } from '@effect/vitest/utils'
import { Data, Equal, pipe } from 'effect'

/**
 * Data Types
 * 
 * The Data module simplifies creating and handling data structures in TypeScript. It provides tools for defining data types, ensuring equality between objects, and hashing data for efficient comparisons.
 * Data模块简化了在TypeScript中创建和处理数据结构的过程。该工具提供用于定义数据类型、确保对象间相等性以及对数据进行哈希处理以实现高效比较的功能。
 * 
 * 值等式
 * 数据模块提供了用于创建数据类型的构造函数，这些构造函数内置了相等性判断和哈希运算支持，从而无需编写自定义实现代码。
 * 这意味着，使用这些构造函数创建的两个值，若具有相同的结构和数值，则被视为相等。
 * 
 * Value Equality: struct / tuple / array
 * 
 * 
 * Data / Equal / 
 * 
 * 标记结构的联合要创建带标签结构体的不相交并集，可以使用 Data。标签：枚举和数据。标签。这些工具使得定义和操作普通对象的联合体变得非常简便。
 * 
 * 
 * 错误标签错误 这些构造函数不仅让定义自定义错误类型变得简单直接，还提供了诸如相等性检查和结构化错误处理等实用集成功能。
 */

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
