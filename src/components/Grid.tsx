import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import { AlgoMap, AlgoTypes, bfs, dfs, Path, dfsToBfs } from '../algos'
import Cell from './Cell'

interface GridProps {}

const randInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const algos: AlgoMap = {
  bfs: {
    name: 'bfs',
    title: 'Breadth First Search',
    fn: bfs,
    next: 'dfs',
    desc:
      'Breadth First Search (BFS) traverses the grid one step of distance (measured from the entrance) at a time. It will therefore always find the shortest possible path.'
  },
  dfs: {
    name: 'dfs',
    title: 'Depth First Search',
    fn: dfs,
    next: 'dfsToBfs',
    desc:
      "Depth First Search (DFS) traverses as far as it can go along one exploration path. It will generally not find the shortest path because it's unaware of shortcuts."
  },
  dfsToBfs: {
    name: 'dfsToBfs',
    title: 'DFS to BFS',
    fn: dfsToBfs,
    next: 'bfs',
    desc:
      'DFS to BFS explores with DFS and runs a BFS on explored cells after finding the exit, meaning it will find the shortest explored path (not necessarily the shortest possible path).'
  }
}

export const Grid: React.FC<GridProps> = () => {
  const rows = 20,
    cols = 40
  const [probability, setProbability] = useState(35)
  const initialTarget = useMemo(
    () => [randInt(5, rows - 1), randInt(5, cols - 1)],
    []
  )

  const [target, setTarget] = useState(initialTarget)

  let emptyGrid = useCallback((t: number[]) => {
    let g = Array(rows)
      .fill(Array(cols).fill(0))
      .map(r => r.map(() => 1000))
    g[0][0] = 0
    const [tr, tc] = t
    g[tr][tc] = 4000
    return g as number[][]
  }, [])

  const [cells, setCells] = useState([] as number[][])
  const [stack, setStack] = useState([] as number[][])
  const [path, setPath] = useState<Path>({})
  const [algo, setAlgo] = useState<AlgoTypes>('bfs')
  const [frame, setFrame] = useState(0)
  const [speed, setSpeed] = useState(50)
  const [done, setDone] = useState(false)
  const [start, setStart] = useState(false)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [cur, setCur] = useState([0, 0])
  const [drag, setDrag] = useState(false)
  const [drawType, setDrawType] = useState('empty cells')

  const newRandom = useCallback(
    (t: number[]) => {
      setStack([[0, 0, 0]])
      let randomGrid: number[][] = emptyGrid(t).map(r =>
        r.map(() => (Math.random() * 100 > probability ? 1000 : -1))
      )

      randomGrid[0][0] = 0
      const [tr, tc] = [randInt(5, rows - 1), randInt(5, cols - 1)]
      setTarget([tr, tc])
      randomGrid[tr][tc] = 4000
      setCells(randomGrid)
      setFrame(0)
      setDone(false)
      setPath({})
      setStart(false)
    },
    [emptyGrid, probability]
  )

  const repeat = () => {
    let resetCells = cells.map(row => row.map(c => (c > 0 ? 1000 : c)))
    resetCells[0][0] = 0
    const [tr, tc] = target
    resetCells[tr][tc] = 4000
    setCells(resetCells)
    setStack([[0, 0, 0]])
    setFrame(0)
    setDone(false)
    setPath({})
    setStart(false)
  }

  const preventDefault = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
  }

  const toggleDrawType = () => {
    if (drawType === 'empty cells') setDrawType('walls')
    else setDrawType('empty cells')
  }

  const toggle = (i: number, j: number) => (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventDefault(e)
    let toggledCells = cells.map(row => row.map(c => (c > 0 ? 1000 : c)))
    const [tr, tc] = target

    if (e.buttons === 2) {
      toggledCells[i][j] = 4000
      toggledCells[0][0] = 0
      toggledCells[tr][tc] = 1000
      setTarget([i, j])
      setCells(toggledCells)
      setPath({})
      setStart(false)
      setDone(false)
      setStack([[0, 0, 0]])
      setFrame(0)
      forceUpdate()
    } else if (drag || e.buttons === 1) {
      toggledCells[i][j] = drawType === 'walls' ? -1 : 1000
      toggledCells[0][0] = 0
      toggledCells[tr][tc] = 4000
      setCells(toggledCells)
      setPath({})
      setStart(false)
      setStack([[0, 0, 0]])
      setDone(false)
      setFrame(0)
      forceUpdate()
    }
  }

  useEffect(() => {
    newRandom(initialTarget)
  }, [rows, cols, newRandom, initialTarget])

  useEffect(() => {
    if (start && stack.length > 0 && !done) {
      const interval = setInterval(() => {
        const { current, nextStack, nextCells, done, path } = algos[algo].fn({
          cells,
          stack
        })
        setCur(current)
        setStack(nextStack)
        setCells(nextCells)
        setDone(done)
        setFrame(frame + 1)
        if (done) {
          setPath(path)
        }
      }, 500 / speed)
      return () => {
        clearInterval(interval)
      }
    }
  }, [algo, cells, done, frame, speed, stack, start])
  return (
    <>
      <div className='infoWrapper'>
        <div className='info'>
          <h1 className='algo-title'>{algos[algo].title}</h1>
          <p>{algos[algo].desc}</p>
          <button onClick={() => setAlgo(algos[algo].next)}>
            next algorithm
          </button>
        </div>
        <div className='controls'>
          <div className='control-row'>
            <div className='control-item'>Step: {frame}</div>
            {done ? (
              <button
                className='control-item'
                onClick={() => {
                  repeat()
                  setStart(true)
                }}
              >
                restart
              </button>
            ) : !start ? (
              <button className='control-item' onClick={() => setStart(true)}>
                play
              </button>
            ) : (
              <button className='control-item' onClick={() => setStart(false)}>
                pause
              </button>
            )}
            <button className='control-item' onClick={() => newRandom(target)}>
              new
            </button>
            <button className='control-item' onClick={repeat}>
              reset
            </button>
          </div>
          <div className='control-row'>
            <div className='control-item'>
              <label>Speed</label>
              <input
                type='range'
                min='1'
                max='100'
                name='speed'
                value={speed}
                onChange={e => {
                  setSpeed(parseInt(e.target.value))
                }}
              />
            </div>
            <div className='control-item'>
              <label>Chance of Wall</label>
              <input
                type='range'
                min='0'
                max='100'
                name='probability'
                value={probability}
                onChange={e => {
                  setProbability(parseInt(e.target.value))
                }}
              />
            </div>
          </div>
          <div className='' style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <p>
                <strong>Left-click</strong> and <strong>drag</strong> to draw
              </p>
              <button className='control-item' onClick={toggleDrawType}>
                {drawType} (toggle)
              </button>
            </div>
            <p>
              <strong>Right-click</strong> to move the target cell.
            </p>
          </div>
        </div>
      </div>
      <div
        className='grid'
        onContextMenu={preventDefault}
        onMouseDown={() => setDrag(true)}
        onMouseUp={() => setDrag(false)}
        onMouseLeave={() => setDrag(false)}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${70 /
            Math.max(cols, rows)}vw)`,
          gridTemplateRows: `repeat(${rows}, ${70 / Math.max(cols, rows)}vw)`
        }}
      >
        {cells.map((row, i) =>
          row.flatMap((cell, j) => {
            const key = i + '-' + j
            if (key in path)
              return (
                <Cell
                  key={key}
                  handleInteraction={toggle(i, j)}
                  kind='path'
                  label={cell.toString()}
                />
              )
            if (cell === 0 || cell === 4000)
              return <Cell key={key} kind='gate' label='↘︎' />
            if (cell === -1)
              return (
                <Cell
                  key={key}
                  handleInteraction={toggle(i, j)}
                  kind='wall'
                  label=''
                />
              )
            if (cell > 0 && cell < 1000)
              return (
                <Cell
                  key={key}
                  handleInteraction={toggle(i, j)}
                  kind={i === cur[0] && j === cur[1] ? 'current' : 'visited'}
                  label={cell.toString()}
                />
              )
            return (
              <Cell
                key={key}
                handleInteraction={toggle(i, j)}
                kind=''
                label='∞'
              />
            )
          })
        )}
      </div>
    </>
  )
}

export default Grid
