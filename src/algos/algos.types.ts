type AlgoProps = {
  cells: number[][]
  stack: number[][]
}

type AlgoResults = {
  current: number[]
  nextCells: number[][]
  nextStack: number[][]
  done: boolean
}

export type AlgoTypes = 'dfs' | 'bfs'

export type AlgoFunction = (props: AlgoProps) => AlgoResults

export type AlgoMap = {
  [key in AlgoTypes]: AlgoFunction
}
