import { AlgoFunction, dirs, Path } from '.'
import { findPath } from './shortestPath'

export const dfs: AlgoFunction = ({ cells, stack }) => {
  let nextCells = cells
  let nextStack = [...stack]
  let path: Path = {}
  const [row, col, val] = nextStack.pop()!
  const current = [row, col]
  if (nextCells[row][col] === 4000) {
    nextCells[row][col] = val
    path = findPath({ cells, end: current })
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
