import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/SideBar";
import Topbar from "../components/TopBar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis 
} from "recharts";

const getOrdinalNum = (n) => {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
};

const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const dateNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName} ${getOrdinalNum(dateNum)} ${monthName} ${year}`;
};

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [taskFilter, setTaskFilter] = useState('All'); 
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [issuesRes, projectsRes] = await Promise.all([
          api.get('/issues'),
          api.get('/projects')
        ]);
        setIssues(Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data?.issues || []));
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.projects || []));
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const myProjects = projects.filter(p => 
    p.owner?._id === user?._id || p.owner === user?._id || 
    (p.members && p.members.some(m => m._id === user?._id || m === user?._id))
  );

  useEffect(() => {
    if (myProjects.length > 0 && selectedProjectId === 'all') {
      setSelectedProjectId(myProjects[0]._id);
    }
  }, [myProjects, selectedProjectId]);

  const projectTasks = issues.filter(issue => {
    const pId = issue.projectId?._id || issue.projectId;
    return pId === selectedProjectId;
  });

  const completedTasks = projectTasks.filter(t => t.status === 'Done' || t.status === 'Completed');
  const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress');
  const pendingTasks = projectTasks.filter(t => t.status === 'Planning' || t.status === 'Todo');

  const lowPriority = projectTasks.filter(t => t.priority === 'Low').length;
  const mediumPriority = projectTasks.filter(t => t.priority === 'Medium').length;
  const highPriority = projectTasks.filter(t => t.priority === 'High').length;

  const pieData = [
    { name: 'Completed', value: completedTasks.length, fill: '#ec4899' }, 
    { name: 'In Progress', value: inProgressTasks.length, fill: '#3b82f6' }, 
    { name: 'Pending', value: pendingTasks.length, fill: '#eab308' }, 
  ];

  const barData = [
    { name: 'Low', value: lowPriority, fill: '#4ade80' },
    { name: 'Medium', value: mediumPriority, fill: '#f59e0b' },
    { name: 'High', value: highPriority, fill: '#ef4444' },
  ];

  const filteredRecentTasks = projectTasks.filter(t => {
    if (taskFilter === 'All') return true;
    if (taskFilter === 'In Progress') return t.status === 'In Progress';
    if (taskFilter === 'Completed') return t.status === 'Done' || t.status === 'Completed';
    if (taskFilter === 'Pending') return t.status === 'Planning' || t.status === 'Todo';
    return true;
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const StatCard = ({ title, value, colorClass }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 ${colorClass} border-gray-100 dark:border-gray-700`}>
      <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{title}</h4>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          
    
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-4">
            <div className="relative z-10 flex flex-col">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                Project Analytics
              </h2>
              <div className="flex items-center gap-4 mt-2">
                 <span className="text-blue-100 font-medium">Select Project:</span>
                 <select 
                   value={selectedProjectId}
                   onChange={e => setSelectedProjectId(e.target.value)}
                   className="bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2 font-bold outline-none cursor-pointer focus:ring-2 focus:ring-white/50 min-w-[200px]"
                 >
                   {myProjects.map(p => (
                     <option key={p._id} value={p._id} className="text-gray-900">{p.projectName}</option>
                   ))}
                   {myProjects.length === 0 && <option value="" className="text-gray-900">No Projects Found</option>}
                 </select>
              </div>
            </div>
            <button 
              onClick={() => navigate('/HomePage')} 
              className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-50 transition relative z-10 whitespace-nowrap"
            >
              Back to Dashboard
            </button>
            
            
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute right-32 -bottom-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-48">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : (
            <>
           
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Tasks" value={projectTasks.length} colorClass="border-l-blue-500" />
                <StatCard title="Pending Tasks" value={pendingTasks.length} colorClass="border-l-yellow-400" />
                <StatCard title="In Progress Tasks" value={inProgressTasks.length} colorClass="border-l-green-500" />
                <StatCard title="Completed Tasks" value={completedTasks.length} colorClass="border-l-pink-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Task Distribution</h3>
                  <div className="h-[250px] w-full">
                    {projectTasks.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                    )}
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }}></span>
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Task Priority Levels</h3>
                  <div className="h-[250px] w-full">
                    {projectTasks.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          barSize={60}
                        >
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} allowDecimals={false} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                          />
                          <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                       <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[300px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Recent Tasks</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                      Showing {filteredRecentTasks.length} {taskFilter === 'All' ? 'total' : taskFilter.toLowerCase()} task{filteredRecentTasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl flex items-center space-x-1 auto-cols-auto overflow-x-auto w-full sm:w-auto">
                    {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                       <button 
                         key={f}
                         onClick={() => setTaskFilter(f)}
                         className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                           taskFilter === f 
                           ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                           : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                         }`}
                       >
                         {f}
                       </button>
                    ))}
                  </div>
                </div>

                {filteredRecentTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Task Name</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Priority</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecentTasks.map(task => (
                          <tr key={task._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="py-4">
                              <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                              {task.projectName && <p className="text-xs text-gray-500 font-medium mt-1">{task.projectName}</p>}
                            </td>
                            <td className="py-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                                task.status === 'Done' || task.status === 'Completed' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {task.status || 'Planning'}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 flex items-center w-max gap-1 rounded-full ${
                                task.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                task.priority === 'Medium' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                {task.priority || 'Medium'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => navigate(`/issues/${task._id}`)}
                                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 mt-4">
                    <p className="text-gray-500 font-medium">No tasks found for "{taskFilter}"</p>
                  </div>
                )}
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Analytics;