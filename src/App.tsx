import React from 'react'
import './App.css'
import Grid from './components/Grid'

function App () {
  return (
    <div className='App'>
      {/* <h1>Dijkstra's Algorithm Visualizer</h1> */}
      <Grid />
      <div className='byline'>
        Built in React by{' '}
        <a href='https://github.com/imjoshellis/dijkstra'>Josh Ellis</a>
      </div>
    </div>
  )
}

export default App
