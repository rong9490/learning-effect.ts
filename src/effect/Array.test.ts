import { describe, it } from '@effect/vitest' // 特有的vitest -> 有什么区别?
// import { describe, it } from 'vitest'
import { assertNone, assertSome, deepStrictEqual, strictEqual, throws } from "@effect/vitest/utils"
// 待测试的方法
import {
    Array as Arr,
    Either,
    FastCheck as fc,
    identity,
    Number as Num,
    Option,
    Order,
    pipe,
    type Predicate,
    String as Str
} from "effect"

const symA = Symbol.for("a")
const symB = Symbol.for("b")
const symC = Symbol.for("c")
const double = (n: number) => n * 2

/**
 * 必须使用本地: 
 * bun run test src/effect/Array.test.ts
 * dummy_effect/packages/effect/test/Array.test.ts
 * 
 * */

describe("Array", () => {
    it("of", () => {
        // 生成数组
        deepStrictEqual(Arr.of(1), [1])
    })

    it("fromIterable/Array should return the same reference if the iterable is an Array", () => {
        const i = [1, 2, 3]
        strictEqual(Arr.fromIterable(i), i)
    })

    it("fromIterable/Iterable", () => {
        // 转换成数组
        deepStrictEqual(Arr.fromIterable(new Set([1, 2, 3])), [1, 2, 3])
    })

    it("ensure", () => {
        // fronIterable 迭代器转换 / ensure 包裹成数组
        deepStrictEqual(Arr.ensure(1), [1])
        deepStrictEqual(Arr.ensure(null), [null])
        deepStrictEqual(Arr.ensure([1]), [1])
        deepStrictEqual(Arr.ensure([1, 2]), [1, 2])
        deepStrictEqual(Arr.ensure(new Set([1, 2])), [new Set([1, 2])])
    })

    describe("iterable inputs", () => {
        it("prepend", () => {
            // 前置追加一个元素 Arr.prepend(x)
            deepStrictEqual(pipe([1, 2, 3], Arr.prepend(0)), [0, 1, 2, 3])
            deepStrictEqual(pipe([[2]], Arr.prepend([1])), [[1], [2]])

            deepStrictEqual(pipe(new Set([1, 2, 3]), Arr.prepend(0)), [0, 1, 2, 3])
            deepStrictEqual(pipe(new Set([[2]]), Arr.prepend([1])), [[1], [2]])
        })

        it("prependAll", () => {
            // 前置追加多个元素 Arr.prependAll([x, y])
            deepStrictEqual(pipe([3, 4], Arr.prependAll([1, 2])), [1, 2, 3, 4])

            deepStrictEqual(pipe([3, 4], Arr.prependAll(new Set([1, 2]))), [1, 2, 3, 4])
            deepStrictEqual(pipe(new Set([3, 4]), Arr.prependAll([1, 2])), [1, 2, 3, 4])
        })

        it("append", () => {
            // 后继追加
            deepStrictEqual(pipe([1, 2, 3], Arr.append(4)), [1, 2, 3, 4])
            deepStrictEqual(pipe([[1]], Arr.append([2])), [[1], [2]])

            deepStrictEqual(pipe(new Set([1, 2, 3]), Arr.append(4)), [1, 2, 3, 4])
            deepStrictEqual(pipe(new Set([[1]]), Arr.append([2])), [[1], [2]])
        })

        it("appendAll", () => {
            deepStrictEqual(pipe([1, 2], Arr.appendAll([3, 4])), [1, 2, 3, 4])

            deepStrictEqual(pipe([1, 2], Arr.appendAll(new Set([3, 4]))), [1, 2, 3, 4])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.appendAll([3, 4])), [1, 2, 3, 4])
        })

        // 累计(rxjs.scan)
        it("scan", () => {
            const f = (b: number, a: number) => b - a
            deepStrictEqual(pipe([1, 2, 3], Arr.scan(10, f)), [10, 9, 7, 4])
            deepStrictEqual(pipe([0], Arr.scan(10, f)), [10, 10])
            deepStrictEqual(pipe([], Arr.scan(10, f)), [10])

            deepStrictEqual(pipe(new Set([1, 2, 3]), Arr.scan(10, f)), [10, 9, 7, 4])
            deepStrictEqual(pipe(new Set([0]), Arr.scan(10, f)), [10, 10])
            deepStrictEqual(pipe(new Set([]), Arr.scan(10, f)), [10])
        })

        // 逆向累计
        it("scanRight", () => {
            const f = (b: number, a: number) => a - b
            deepStrictEqual(pipe([1, 2, 3], Arr.scanRight(10, f)), [-8, 9, -7, 10])
            deepStrictEqual(pipe([0], Arr.scanRight(10, f)), [-10, 10])
            deepStrictEqual(pipe([], Arr.scanRight(10, f)), [10])

            deepStrictEqual(pipe(new Set([1, 2, 3]), Arr.scanRight(10, f)), [-8, 9, -7, 10])
            deepStrictEqual(pipe(new Set([0]), Arr.scanRight(10, f)), [-10, 10])
            deepStrictEqual(pipe(new Set([]), Arr.scanRight(10, f)), [10])
        })

        it("tail", () => {
            // 排除第一位
            assertSome(Arr.tail([1, 2, 3]), [2, 3])
            assertNone(Arr.tail([]))

            assertSome(Arr.tail(new Set([1, 2, 3])), [2, 3])
            assertNone(Arr.tail(new Set([])))
        })

        it("init", () => {
            // init ? 排除末尾
            assertSome(Arr.init([1, 2, 3]), [1, 2])
            assertNone(Arr.init([]))

            assertSome(Arr.init(new Set([1, 2, 3])), [1, 2])
            assertNone(Arr.init(new Set([])))
        })

        it("take", () => {
            // pipe 用法 -> Arr.take()
            deepStrictEqual(pipe([1, 2, 3, 4], Arr.take(2)), [1, 2])
            deepStrictEqual(pipe([1, 2, 3, 4], Arr.take(0)), [])
            // out of bounds
            deepStrictEqual(pipe([1, 2, 3, 4], Arr.take(-10)), [])
            deepStrictEqual(pipe([1, 2, 3, 4], Arr.take(10)), [1, 2, 3, 4])

            deepStrictEqual(pipe(new Set([1, 2, 3, 4]), Arr.take(2)), [1, 2])
            deepStrictEqual(pipe(new Set([1, 2, 3, 4]), Arr.take(0)), [])
            // out of bounds
            deepStrictEqual(pipe(new Set([1, 2, 3, 4]), Arr.take(-10)), [])
            deepStrictEqual(pipe(new Set([1, 2, 3, 4]), Arr.take(10)), [1, 2, 3, 4])
        })

        it("takeRight", () => {
            deepStrictEqual(pipe(Arr.empty(), Arr.takeRight(0)), [])
            deepStrictEqual(pipe([1, 2], Arr.takeRight(0)), [])
            deepStrictEqual(pipe([1, 2], Arr.takeRight(1)), [2])
            deepStrictEqual(pipe([1, 2], Arr.takeRight(2)), [1, 2])
            // out of bound
            deepStrictEqual(pipe(Arr.empty(), Arr.takeRight(1)), [])
            deepStrictEqual(pipe(Arr.empty(), Arr.takeRight(-1)), [])
            deepStrictEqual(pipe([1, 2], Arr.takeRight(3)), [1, 2])
            deepStrictEqual(pipe([1, 2], Arr.takeRight(-1)), [])

            deepStrictEqual(pipe(new Set(), Arr.takeRight(0)), [])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.takeRight(0)), [])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.takeRight(1)), [2])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.takeRight(2)), [1, 2])
            // out of bound
            deepStrictEqual(pipe(new Set(), Arr.takeRight(1)), [])
            deepStrictEqual(pipe(new Set(), Arr.takeRight(-1)), [])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.takeRight(3)), [1, 2])
            deepStrictEqual(pipe(new Set([1, 2]), Arr.takeRight(-1)), [])
        })

        it("takeWhile", () => {
            // While 执行谓词断言函数
            const f = (n: number) => n % 2 === 0
            deepStrictEqual(pipe([2, 4, 3, 6], Arr.takeWhile(f)), [2, 4])
            deepStrictEqual(pipe(Arr.empty(), Arr.takeWhile(f)), [])
            deepStrictEqual(pipe([1, 2, 4], Arr.takeWhile(f)), [])
            deepStrictEqual(pipe([2, 4], Arr.takeWhile(f)), [2, 4])

            deepStrictEqual(pipe(new Set([2, 4, 3, 6]), Arr.takeWhile(f)), [2, 4])
            deepStrictEqual(pipe(new Set<number>(), Arr.takeWhile(f)), [])
            deepStrictEqual(pipe(new Set([1, 2, 4]), Arr.takeWhile(f)), [])
            deepStrictEqual(pipe(new Set([2, 4]), Arr.takeWhile(f)), [2, 4])
        })

        // TODO ?? 没理解
        it("span", () => {
            const f = Arr.span<number>((n) => n % 2 === 1)
            const assertSpan = (
                input: Iterable<number>,
                expectedInit: ReadonlyArray<number>,
                expectedRest: ReadonlyArray<number>
            ) => {
                const [init, rest] = f(input) // span 拆分 ?
                deepStrictEqual(init, expectedInit)
                deepStrictEqual(rest, expectedRest)
            }
            assertSpan([1, 3, 2, 4, 5], [1, 3], [2, 4, 5])
            assertSpan(Arr.empty(), Arr.empty(), Arr.empty())
            assertSpan([1, 3], [1, 3], Arr.empty())
            assertSpan([2, 4], Arr.empty(), [2, 4])

            assertSpan(new Set([1, 3, 2, 4, 5]), [1, 3], [2, 4, 5])
            assertSpan(new Set(), Arr.empty(), Arr.empty())
            assertSpan(new Set([1, 3]), [1, 3], Arr.empty())
            assertSpan(new Set([2, 4]), Arr.empty(), [2, 4])
        })

        it("splitWhere", () => {
            const f = Arr.splitWhere<number>((n) => n % 2 !== 1)
            const assertSplitWhere = (
                input: Iterable<number>,
                expectedInit: ReadonlyArray<number>,
                expectedRest: ReadonlyArray<number>
            ) => {
                const [init, rest] = f(input)
                deepStrictEqual(init, expectedInit)
                deepStrictEqual(rest, expectedRest)
            }
            assertSplitWhere([1, 3, 2, 4, 5], [1, 3], [2, 4, 5])
            assertSplitWhere(Arr.empty(), Arr.empty(), Arr.empty())
            assertSplitWhere([1, 3], [1, 3], Arr.empty())
            assertSplitWhere([2, 4], Arr.empty(), [2, 4])

            assertSplitWhere(new Set([1, 3, 2, 4, 5]), [1, 3], [2, 4, 5])
            assertSplitWhere(new Set(), Arr.empty(), Arr.empty())
            assertSplitWhere(new Set([1, 3]), [1, 3], Arr.empty())
            assertSplitWhere(new Set([2, 4]), Arr.empty(), [2, 4])
        })

        it("split", () => {
            deepStrictEqual(pipe(Arr.empty(), Arr.split(2)), Arr.empty())
            deepStrictEqual(pipe(Arr.make(1), Arr.split(2)), Arr.make(Arr.make(1)))
            deepStrictEqual(pipe(Arr.make(1, 2), Arr.split(2)), Arr.make(Arr.make(1), Arr.make(2)))
            deepStrictEqual(pipe(Arr.make(1, 2, 3, 4, 5), Arr.split(2)), Arr.make(Arr.make(1, 2, 3), Arr.make(4, 5)))
            deepStrictEqual(
                pipe(Arr.make(1, 2, 3, 4, 5), Arr.split(3)),
                Arr.make(Arr.make(1, 2), Arr.make(3, 4), Arr.make(5))
            )
        })
    })
})