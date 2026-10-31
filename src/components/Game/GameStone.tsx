const COLORS = ['#e6d3b0', '#d2b48c', '#c4b49a', '#b7c0b4', '#dfc89a', '#a89880']

export function GameStone({ seed, index, total }: { seed: number; index: number; total: number }) {
  const angle = (-90 + (360 / Math.max(total, 1)) * index) * (Math.PI / 180)
  const radius = total <= 1 ? 0 : 28
  const x = 50 + Math.cos(angle) * radius
  const y = 52 + Math.sin(angle) * radius
  const color = COLORS[Math.abs(seed) % COLORS.length]
  return (
    <span
      className="kumalak"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle at 35% 30%, #fff8ec, ${color} 58%, #6a5642)`,
      }}
    />
  )
}
