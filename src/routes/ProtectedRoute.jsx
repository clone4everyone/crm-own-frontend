import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProfile } from '../features/auth/authSlice'


export default function ProtectedRoute({ allowedRoles = [] }){
const { user, token } = useSelector((s) => s.auth)
const dispatch = useDispatch()


useEffect(() => {
    // console.log(user)
if (token && !user) {
    // console.log("inside useEffect")
dispatch(fetchProfile())
}
}, [token])


if (!token) return <Navigate to="/login" replace />
if (allowedRoles.length && user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
return <Outlet />
}