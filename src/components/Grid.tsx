import React, { useCallback, useEffect, useReducer, useState } from 'react'

interface GridProps {}

const randInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const Grid: React.FC<GridProps> = () => {
  const [rows, setRows] = useState(20)
  const [cols, setCols] = useState(40)
  const [probability, setProbability] = useState(35)
  const [target, setTarget] = useState([
    randInt(1, rows - 1),
    randInt(1, cols - 1)
  ])

  let emptyGrid = useCallback(() => {
    let g = Array(rows)
      .fill(Array(cols).fill(0))
      .map(r => r.map(() => 1000))
    g[0][0] = 0
    const [tr, tc] = target
    g[tr][tc] = 4000
    return g as number[][]
  }, [cols, rows])

  const [cells, setCells] = useState([] as number[][])
  const [stack, setStack] = useState([] as number[][])
  const [frame, setFrame] = useState(0)
  const [speed, setSpeed] = useState(50)
  const [done, setDone] = useState(false)
  const [start, setStart] = useState(false)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [cur, setCur] = useState(0)

  const newRandom = useCallback(() => {
    setStack([[0, 0]])
    let randomGrid: number[][] = emptyGrid().map(r =>
      r.map(() => (Math.random() * 100 > probability ? 1000 : -1))
    )

    randomGrid[0][0] = 0
    const [tr, tc] = [randInt(1, rows - 1), randInt(1, cols - 1)]
    randomGrid[tr][tc] = 4000
    setTarget([tr, tc])
    setCells(randomGrid)
    setFrame(0)
    setDone(false)
    setStart(false)
  }, [cols, emptyGrid, probability, rows])

  const repeat = () => {
    let resetCells = cells.map(row => row.map(c => (c > 0 ? 1000 : c)))
    resetCells[0][0] = 0
    const [tr, tc] = target
    resetCells[tr][tc] = 4000
    setCells(resetCells)
    setStack([[0, 0]])
    setFrame(0)
    setDone(false)
    setStart(false)
  }

  const toggle = (i: number, j: number) => {
    let toggledCells = cells.map(row => row.map(c => (c > 0 ? 1000 : c)))
    toggledCells[i][j] = toggledCells[i][j] >= 0 ? -1 : 1000
    toggledCells[0][0] = 0
    const [tr, tc] = target
    toggledCells[tr][tc] = 4000
    setCells(toggledCells)
    setStart(false)
    setDone(false)
    setStack([[0, 0]])
    setFrame(0)
    forceUpdate()
  }

  useEffect(() => {
    newRandom()
  }, [rows, cols, newRandom])

  useEffect(() => {
    const dirs = [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0]
    ]

    const dfs = () => {
      let nextCells = cells
      let nextStack = stack
      const [row, col] = nextStack.pop()!
      setCur(nextCells[row][col])
      for (const [i, j] of dirs) {
        const r = row + i
        const c = col + j
        if (
          r < 0 ||
          r >= nextCells.length ||
          c < 0 ||
          c >= nextCells[0].length
        ) {
          continue
        }
        if (nextCells[r][c] === 4000) {
          setFrame(frame + 1)
          setDone(true)
        }
        if (nextCells[r][c] === 1000) {
          nextCells[r][c] = nextCells[row][col] + 1
          nextStack.push([r, c])
        }
      }
      setStack(nextStack)
      setCells(nextCells)
      setFrame(frame + 1)
    }

    const bfs = () => {
      let nextCells = cells
      let nextStack = [] as number[][]
      for (const [row, col] of stack) {
        setCur(nextCells[row][col])
        for (const [i, j] of dirs) {
          const r = row + i
          const c = col + j
          if (
            r < 0 ||
            r >= nextCells.length ||
            c < 0 ||
            c >= nextCells[0].length
          ) {
            continue
          }
          if (nextCells[r][c] === 4000) {
            setFrame(frame + 1)
            setDone(true)
          }
          if (nextCells[r][c] === 1000) {
            nextCells[r][c] = nextCells[row][col] + 1
            nextStack.push([r, c])
          }
        }
      }
      setStack(nextStack)
      setCells(nextCells)
      setFrame(frame + 1)
    }

    if (start && stack.length > 0 && !done) {
      const interval = setInterval(() => dfs(), 1000 / speed)
      return () => {
        clearInterval(interval)
      }
    }
  }, [cells, done, frame, speed, stack, start])
  return (
    <>
      <div className='controls'>
        <div className='control-row'>
          Step: {frame}
          Speed{' '}
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
          {!start ? (
            <button onClick={() => setStart(true)}>play</button>
          ) : (
            <button onClick={() => setStart(false)}>pause</button>
          )}
        </div>
        <div className='control-row'>
          Chance of Wall:{' '}
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
          Rows:{' '}
          <input
            type='number'
            min='5'
            max='100'
            name='rows'
            value={rows}
            onChange={e => {
              if (parseInt(e.target.value) >= 5) {
                setRows(parseInt(e.target.value))
              }
            }}
          />
          Columns:{' '}
          <input
            type='number'
            min='5'
            max='100'
            name='cols'
            value={cols}
            onChange={e => {
              if (parseInt(e.target.value) >= 5) {
                setCols(parseInt(e.target.value))
              }
            }}
          />
          <button onClick={newRandom}>new</button>
          <button onClick={repeat}>reset</button>
        </div>
      </div>
      <div
        className='grid'
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
                onClick={() => toggle(i, j)}
                className={
                  cell >= 0
                    ? cell === 1000
                      ? 'cell'
                      : cell === cur
                      ? 'cell current'
                      : 'cell visited'
                    : 'cell wall'
                }
              >
                {cell === 1000 ? '∞' : cell >= 0 ? cell : ''}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default Grid
