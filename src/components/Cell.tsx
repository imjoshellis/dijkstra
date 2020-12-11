import React from 'react'

interface CellProps {
  kind: string
  label: string
  handleInteraction?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export const Cell: React.FC<CellProps> = ({
  kind,
  label,
  handleInteraction
}) => {
  return (
    <div
      tabIndex={-1}
      onMouseDown={handleInteraction}
      onMouseEnter={handleInteraction}
      className={`cell ${kind}`}
    >
      {label}
    </div>
  )
}

export default Cell
