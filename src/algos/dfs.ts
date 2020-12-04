import { AlgoFunction, dirs } from '.'

export const dfs: AlgoFunction = ({ cells, stack }) => {
  let nextCells = cells
  let nextStack = [...stack]
  const [row, col] = nextStack.pop()!
  const current = [row, col]
  for (const [i, j] of dirs) {
    const r = row + i
    const c = col + j
    if (r < 0 || r >= nextCells.length || c < 0 || c >= nextCells[0].length) {
      continue
    }
    if (nextCells[r][c] === 4000) {
      return { current, nextStack, nextCells, done: true }
    }
    if (nextCells[r][c] === 1000) {
      nextCells[r][c] = nextCells[row][col] + 1
      nextStack.push([r, c])
    }
  }
  return { current, nextStack, nextCells, done: false }
}
