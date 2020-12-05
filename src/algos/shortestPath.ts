import { ShortestPath, dirs, Path } from '.'

export const findPath: ShortestPath = ({ cells, end: [row, col] }) => {
  let path: Path = {}

  for (let k = cells[row][col]; k > 0; k--) {
    for (let [i, j] of dirs) {
      const r = row + i
      const c = col + j
      if (r < 0 || r >= cells.length || c < 0 || c >= cells[0].length) {
        continue
      }
      if (cells[r][c] === k - 1) {
        row = r
        col = c
        path[`${r}-${c}`] = true
      }
    }
  }
  return path
}
