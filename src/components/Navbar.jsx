import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'


export default function Navbar(){
const dispatch = useDispatch()
const navigate = useNavigate()
const { user } = useSelector((s) => s.auth)


function doLogout(){
dispatch(logout())
navigate('/login')
}


return (
<nav className="bg-white shadow">
<div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
<div className="font-bold">CRM</div>
<div className="flex items-center gap-4">
<div className="text-sm">{user?.name || user?.email}</div>
<button onClick={doLogout} className="px-3 py-1 border rounded">Logout</button>
</div>
</div>
</nav>
)
}