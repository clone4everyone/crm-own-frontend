import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import projectReducer from '../features/project/projectSlice'
import activityLogReducer from '../features/activityLog/activityLogSlice';
import userReducer from "../features/user/userSlice";
import clientReducer from "../features/client/clientSlice"
import statsSlice from "../features/stats/statsSlice"
import attendanceSlice from "../features/attendance/attendanceSlice"
import developerProjectsReducer from "../features/developerProjects/developerProjectSlice"
import designerProjectReducer from '../features/designerProjects/designerProjectSlice';
import clientDashboardReducer from '../features/client/clientDashboardSlice';
import salesReducer from '../features/lead/salesSlice';
export const store = configureStore({
reducer: {
auth: authReducer,
projects: projectReducer,
users:userReducer,
clients:clientReducer,
stats:statsSlice,
attendance:attendanceSlice,
 developerProjects: developerProjectsReducer,
 designerProjects:designerProjectReducer,
 clientDashboard:clientDashboardReducer,
 sales: salesReducer,
 activityLog: activityLogReducer
},
})