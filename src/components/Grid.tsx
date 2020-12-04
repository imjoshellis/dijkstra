import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import { AlgoMap, AlgoTypes, bfs, dfs } from '../algos'

interface GridProps {}

const randInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const algos: AlgoMap = {
  dfs: dfs,
  bfs: bfs
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
  const [algo, setAlgo] = useState<AlgoTypes>('bfs')
  const [frame, setFrame] = useState(0)
  const [speed, setSpeed] = useState(50)
  const [done, setDone] = useState(false)
  const [start, setStart] = useState(false)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [cur, setCur] = useState([0, 0])

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
    setStart(false)
  }

  const preventDefault = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
  }

  const toggle = (i: number, j: number) => (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventDefault(e)
    let toggledCells = cells.map(row => row.map(c => (c > 0 ? 1000 : c)))
    const [tr, tc] = target
    console.log(e.button, e.buttons)
    if (e.buttons === 2) {
      toggledCells[i][j] = 4000
      toggledCells[0][0] = 0
      toggledCells[tr][tc] = 1000
      setTarget([i, j])
    } else if (e.buttons === 1) {
      toggledCells[i][j] = toggledCells[i][j] >= 0 ? -1 : 1000
      toggledCells[0][0] = 0
      toggledCells[tr][tc] = 4000
    }
    setCells(toggledCells)
    setStart(false)
    setDone(false)
    setStack([[0, 0, 0]])
    setFrame(0)
    forceUpdate()
  }

  useEffect(() => {
    newRandom(initialTarget)
  }, [rows, cols, newRandom, initialTarget])

  useEffect(() => {
    if (start && stack.length > 0 && !done) {
      const interval = setInterval(() => {
        const { current, nextStack, nextCells, done } = algos[algo]({
          cells,
          stack
        })
        setCur(current)
        setStack(nextStack)
        setCells(nextCells)
        setDone(done)
        setFrame(frame + 1)
      }, 500 / speed)
      return () => {
        clearInterval(interval)
      }
    }
  }, [algo, cells, done, frame, speed, stack, start])
  return (
    <>
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
          {algo === 'bfs' ? (
            <button className='control-item' onClick={() => setAlgo('dfs')}>
              using: bfs (click to toggle)
            </button>
          ) : (
            <button className='control-item' onClick={() => setAlgo('bfs')}>
              using: dfs (click to toggle)
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
        <div className='control-row'>
          <div className='control-item'>
            <p>
              <strong>Left-click</strong> to toggle a cell between wall and
              empty. <strong>Right-click</strong> to move the target cell.
            </p>
          </div>
        </div>
      </div>
      <div
        className='grid'
        onContextMenu={preventDefault}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${80 /
            Math.max(cols, rows)}vw)`,
          gridTemplateRows: `repeat(${rows}, ${80 / Math.max(cols, rows)}vw)`
        }}
      >
        {cells.map((row, i) =>
          row.flatMap((cell, j) => {
            const key = i + '-' + j
            if (cell === 0 || cell === 4000)
              return (
                <div key={key} className='cell gate'>
                  ↘︎
                </div>
              )
            return (
              <div
                key={key}
                onMouseDown={toggle(i, j)}
                tabIndex={-1}
                className={
                  cell >= 0
                    ? cell >= 1000
                      ? 'cell'
                      : i === cur[0] && j === cur[1]
                      ? 'cell current'
                      : 'cell visited'
                    : 'cell wall'
                }
              >
                {cell >= 1000 ? '∞' : cell >= 0 ? cell : ''}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default Grid
