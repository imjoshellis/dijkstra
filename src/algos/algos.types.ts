export type Path = {
  [key: string]: boolean
}

type AlgoProps = {
  cells: number[][]
  stack: number[][]
}

type AlgoResults = {
  current: number[]
  nextCells: number[][]
  nextStack: number[][]
  done: boolean
  path: Path
}

export type AlgoTypes = 'dfs' | 'bfs'

export type AlgoFunction = (props: AlgoProps) => AlgoResults

export type AlgoMap = {
  [key in AlgoTypes]: AlgoFunction
}

type ShortestPathProps = {
  cells: number[][]
  end: number[]
}

export type ShortestPath = (props: ShortestPathProps) => Path
