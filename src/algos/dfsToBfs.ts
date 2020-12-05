import { AlgoFunction, dirs, Path } from '.'
import { findPath } from './shortestPath'

export const dfsToBfs: AlgoFunction = ({ cells, stack }) => {
  let nextCells = cells
  let nextStack = [...stack]
  let path: Path = {}
  const [row, col, val] = nextStack.pop()!
  const current = [row, col]
  if (nextCells[row][col] === 4000) {
    nextStack = [[0, 0]]
    const visited = new Set()
    while (nextStack.length > 0) {
      const [r, c] = nextStack.shift()!
      const key = `${r}-${c}`
      if (visited.has(key)) continue
      nextCells[r][c] = minVal(nextCells, r, c)
      visited.add(key)
      for (const [i, j] of dirs) {
        const _r = r + i
        const _c = c + j
        if (
          _r < 0 ||
          _r >= nextCells.length ||
          _c < 0 ||
          _c >= nextCells[0].length
        ) {
          continue
        }
        const cur = nextCells[_r][_c]
        if (cur >= 0 && cur < 1000) {
          nextStack.push([_r, _c])
        }
      }
    }
    nextCells[row][col] = minVal(nextCells, row, col)
    path = findPath({ cells: nextCells, end: current })
    return { current, nextStack, nextCells, done: true, path }
  }
  if (nextCells[row][col] !== 1000 && nextCells[row][col] !== 0) {
    return { current, nextStack, nextCells, done: false, path }
  }
  nextCells[row][col] = val
  for (const [i, j] of dirs) {
    const r = row + i
    const c = col + j
    if (r < 0 || r >= nextCells.length || c < 0 || c >= nextCells[0].length) {
      continue
    }
    if (nextCells[r][c] >= 1000) {
      nextStack.push([r, c, nextCells[row][col] + 1])
    }
  }
  return { current, nextStack, nextCells, done: false, path }
}

const minVal = (cells: number[][], row: number, col: number) => {
  if (cells[row][col] === 0) return 0
  let min: number = Infinity
  for (const [i, j] of dirs) {
    const r = row + i
    const c = col + j
    if (r < 0 || r >= cells.length || c < 0 || c >= cells[0].length) {
      continue
    }
    if (cells[r][c] >= 0) {
      min = Math.min(cells[r][c], min)
    }
  }
  return min + 1
}
