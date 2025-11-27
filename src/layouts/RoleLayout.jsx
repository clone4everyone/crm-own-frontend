import React from 'react'
import roles from '../utils/roles'

export default function RoleLayout({ role, children }){
  // Keep this component simple — you can expand role-based menus here
  return (
    <div>
      <div className="mb-4">
        <div className="text-sm text-gray-500">Role: {role}</div>
        <div className="flex gap-3 mt-2">
          {role === roles.SUPER_ADMIN && <button className="px-3 py-1 bg-blue-50 rounded">Admin Panel</button>}
          {role === roles.SALES && <button className="px-3 py-1 bg-green-50 rounded">Add Lead</button>}
          {role === roles.DESIGNER && <button className="px-3 py-1 bg-purple-50 rounded">My Designs</button>}
          {role === roles.DEVELOPER && <button className="px-3 py-1 bg-yellow-50 rounded">My Tasks</button>}
          {role === roles.CLIENT && <button className="px-3 py-1 bg-gray-50 rounded">Client View</button>}
        </div>
      </div>
      {children}
    </div>
  )
}