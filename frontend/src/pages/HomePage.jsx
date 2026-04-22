import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/SideBar";
import Topbar from "../components/TopBar";

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
    <div>
      <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
    <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/40 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const UnifiedBox = ({ title, items, emptyText, navigate }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm flex flex-col h-[320px] border border-gray-100 dark:border-gray-700">
    <h4 className="font-bold mb-4 dark:text-white flex items-center justify-between text-lg">
      {title}
      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">{items?.length || 0}</span>
    </h4>
    {items && items.length > 0 ? (
      <ul className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {items.map((item) => {
          const isProject = !!item.projectName;
          const href = isProject ? `/projects/${item._id}` : `/issues/${item._id}`;
          const name = isProject ? item.projectName : item.title;
          const typeLabel = isProject ? 'Project' : 'Task';
          
          return (
            <li 
              key={item._id} 
              className="text-sm p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl flex flex-col gap-2 border border-gray-100 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all group" 
              onClick={() => navigate(href)}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-gray-800 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{name}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">{typeLabel}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${item.status === 'Done' || item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {item.status || 'Todo'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  {item.priority || 'Medium'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
         <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
         </div>
         <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{emptyText}</p>
      </div>
    )}
  </div>
);

const HomePage = () => {
  const { toggleTheme } = useContext(ThemeContext);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    projectName: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    startDate: "",
    endDate: "",
    lead: "",
    members: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, issuesRes, activitiesRes] = await Promise.all([
        api.get('/projects').catch(() => ({data: []})),
        api.get('/issues').catch(() => ({data: []})),
        api.get('/activities').catch(() => ({data: []}))
      ]);
      // #region agent log
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H4',location:'frontend/src/pages/HomePage.jsx:fetchData:responses',message:'dashboard responses received',data:{userId:user?._id||null,projectsShape:Array.isArray(projectsRes.data)?'array':typeof projectsRes.data,issuesShape:Array.isArray(issuesRes.data)?'array':typeof issuesRes.data,activitiesShape:Array.isArray(activitiesRes.data)?'array':typeof activitiesRes.data,projectsCount:Array.isArray(projectsRes.data)?projectsRes.data.length:Array.isArray(projectsRes.data?.projects)?projectsRes.data.projects.length:0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.projects || []));
      setIssues(Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data?.issues || []));
      setRecentActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : (activitiesRes.data?.activities || []));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/WelcomePage");
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', form);
      // #region agent log
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H5',location:'frontend/src/pages/HomePage.jsx:handleCreateProject:success',message:'home create project success',data:{userId:user?._id||null,createdProjectId:res?.data?._id||null,ownerType:typeof res?.data?.owner,status:res?.status||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setProjects([...projects, res.data]);
      setShowModal(false);

      setForm({
        projectName: "",
        description: "",
        status: "Planning",
        priority: "Medium",
        startDate: "",
        endDate: "",
        lead: "",
        members: "",
      });
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H1',location:'frontend/src/pages/HomePage.jsx:handleCreateProject:error',message:'home create project failed',data:{userId:user?._id||null,status:err?.response?.status||null,message:err?.response?.data?.message||err?.message||'unknown'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error(err);
      alert("Failed to create project");
    }
  };

  const myTasks = issues.filter(issue => 
    (issue.assignedTo?._id === user?._id || issue.assignedTo === user?._id) &&
    (searchTerm === "" || (issue.title && issue.title.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const myProjects = projects.filter(p => 
    (p.owner?._id === user?._id || p.owner === user?._id || 
    (Array.isArray(p.members) && p.members.some(m => (m._id || m)?.toString() === user?._id?.toString()))) &&
    (searchTerm === "" || (p.projectName && p.projectName.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const completedTasks = myTasks.filter(issue => issue.status === 'Done');

  const overdueItems = [
    ...myTasks.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'Done'),
    ...myProjects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status !== 'Completed')
  ].sort((a,b) => new Date(a.dueDate || a.endDate) - new Date(b.dueDate || b.endDate));

  const inProgressItems = [
    ...myTasks.filter(i => i.status === 'In Progress'),
    ...myProjects.filter(p => p.status === 'In Progress')
  ];

  const completedItems = [
    ...myTasks.filter(i => i.status === 'Done' || i.status === 'Completed'),
    ...myProjects.filter(p => p.status === 'Completed')
  ].sort((a,b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const statIcon1 = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>;
  const statIcon2 = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
  const statIcon3 = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>;
  const statIcon4 = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>;

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar searchTerm={searchTerm} onSearch={setSearchTerm} />

          <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.name}</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Here’s what’s happening with your projects and tasks today.
                </p>
              </div>

              <button
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg font-bold flex items-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                New Project
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Projects" value={myProjects.length} icon={statIcon1} />
                  <StatCard title="Completed Tasks" value={completedTasks.length} icon={statIcon2} />
                  <StatCard title="My Work Items" value={myTasks.length} icon={statIcon3} />
                  <StatCard title="Total Completed" value={completedItems.length} icon={statIcon4} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-extrabold dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                        Project Overview
                      </h3>
                      <button onClick={() => navigate('/ProjectInfo')} className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">View All</button>
                    </div>

                    {projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                         {projects.map(p => (
                           <div key={p._id} className="p-4 border border-gray-100 dark:border-gray-700/60 rounded-xl hover:shadow-lg transition-all cursor-pointer bg-gray-50 dark:bg-gray-900 group" onClick={() => navigate(`/projects/${p._id}`)}>
                             <div className="flex justify-between items-start mb-2">
                               <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-500 transition-colors">{p.projectName}</h4>
                               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {p.status || 'Planning'}
                               </span>
                             </div>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{p.description}</p>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="text-gray-500 font-medium">No projects deployed yet</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700">
                          Create First Project
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px]">
                    <h3 className="text-lg font-extrabold mb-6 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                      Recent Activity
                    </h3>
                    {recentActivities.length > 0 ? (
                      <ul className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivities.slice(0, 15).map(activity => (
                          <li key={activity._id} className="relative pl-4 border-l-2 border-blue-500/30 dark:border-blue-500/50 flex flex-col gap-1">
                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              You {activity.action}
                            </span>
                            {activity.issueId && (
                               <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                 {activity.issueId.title} 
                               </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(activity.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="text-gray-500 text-sm font-medium">No recent activity detected.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
                  <UnifiedBox title="My Assigned Items" items={myTasks} emptyText="No tasks assigned to you" navigate={navigate} />
                  <UnifiedBox title="In Progress" items={inProgressItems} emptyText="No ongoing work detected" navigate={navigate} />
                  <UnifiedBox title="Work Done" items={completedItems} emptyText="No work finished yet!" navigate={navigate} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Create New Project
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 bg-gray-100 dark:bg-gray-700 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Project Name</label>
                <input required type="text" placeholder="e.g. Server Migration" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea rows="3" placeholder="Brief project overview..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-[1px] transition-all">Launch Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;