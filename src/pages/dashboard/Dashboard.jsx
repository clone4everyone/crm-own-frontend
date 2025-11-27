// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { fetchProjects } from '../../features/project/projectSlice'
// import { recordLogin, recordLogout, clearLogId } from '../../features/activityLog/activityLogSlice'
// import SuperAdminDashboard from './SuperAdminDashboard'
// import DeveloperDashboard from './DeveloperDashboard'
// import DesignerDashboard from './DesignerDashboard'
// import ClientDashboard from './ClientDashboard'
// import SalesDashboard from './SalesDashboard'
// import api from '../../api/axios'
// export default function Dashboard(){
//   const dispatch = useDispatch()
//   const { user } = useSelector((s) => s.auth)
//   const { currentLogId } = useSelector((s) => s.activityLog)

//   useEffect(() => {
//     dispatch(fetchProjects())

//     // Record login
//     if (user) {
//       dispatch(recordLogin({
//         userId: user._id,
//         userName: user.name,
//         userRole: user.role,
//         ipAddress: '', // Can be captured from backend
//         userAgent: navigator.userAgent
//       }))
//     }

//     // Record logout on unmount or page close
//     const handleBeforeUnload = () => {
//       if (currentLogId) {
//         // Use sendBeacon for reliable logout tracking
//         const token = localStorage.getItem('token');
//         const data = JSON.stringify({});
//         navigator.sendBeacon(
//             `${api}/activity-logs/logout/${currentLogId}`,
//           new Blob([data], { type: 'application/json' })
//         );
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       if (currentLogId) {
//         dispatch(recordLogout(currentLogId));
//         dispatch(clearLogId());
//       }
//     };
//   }, [dispatch, user]);

//   return <>
//     {
//       user?.role === "super_admin" ? <SuperAdminDashboard/> : 
//       user?.role === "developer" ? <DeveloperDashboard/> :
//       user?.role === "designer" ? <DesignerDashboard/> :
//       user?.role === 'sales' ? <SalesDashboard/> : 
//       <ClientDashboard/>
//     }
//   </>
// }
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects } from '../../features/project/projectSlice'
import { recordLogin, recordLogout, clearLogId } from '../../features/activityLog/activityLogSlice'
import SuperAdminDashboard from './SuperAdminDashboard'
import DeveloperDashboard from './DeveloperDashboard'
import DesignerDashboard from './DesignerDashboard'
import ClientDashboard from './ClientDashboard'
import SalesDashboard from './SalesDashboard'

export default function Dashboard(){
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { currentLogId } = useSelector((s) => s.activityLog)
  const loginRecorded = useRef(false); // Track if login already recorded
const navigate=useNavigate();
  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  useEffect(() => {
    // Record login ONLY ONCE when component mounts
    if (user && !loginRecorded.current && !currentLogId) {
      loginRecorded.current = true;
      dispatch(recordLogin({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        ipAddress: '',
        userAgent: navigator.userAgent
      }))
    }

    // Record logout on page close/refresh
    const handleBeforeUnload = (e) => {
        console.log(currentLogId)
  if (currentLogId) {
    const token = localStorage.getItem('token');
    navigate('/')
    // Use api.defaults.baseURL instead of hardcoded URL
    const url = `${api.defaults.baseURL}/activity-logs/logout/${currentLogId}/${token}`;
    navigator.sendBeacon(url);
  }
};

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]); // Remove currentLogId from dependencies

  return <>
    {
      user?.role === "super_admin" ? <SuperAdminDashboard/> : 
      user?.role === "developer" ? <DeveloperDashboard/> :
      user?.role === "designer" ? <DesignerDashboard/> :
      user?.role === 'sales' ? <SalesDashboard/> : 
      <ClientDashboard/>
    }
  </>
}