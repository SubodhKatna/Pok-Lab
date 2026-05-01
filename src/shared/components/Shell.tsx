import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

export function Shell() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <NavBar />
      <Outlet />
    </div>
  )
}
