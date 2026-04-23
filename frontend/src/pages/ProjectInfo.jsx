import React, { useState, useEffect, useContext } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SideBar';
import Topbar from '../components/TopBar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ProjectInfo = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [form, setForm] = useState({
    projectName: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    startDate: "",
    endDate: "",
    lead: ""
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/projects');
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H3',location:'frontend/src/pages/ProjectInfo.jsx:fetchProjects:success',message:'project list fetched',data:{userId:user?._id||null,responseShape:Array.isArray(res.data)?'array':typeof res.data,projectCount:Array.isArray(res.data)?res.data.length:Array.isArray(res.data?.projects)?res.data.projects.length:0},timestamp:Date.now()})}).catch(()=>{});
      setProjects(Array.isArray(res.data) ? res.data : (res.data?.projects || []));
    } catch (err) {
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H2',location:'frontend/src/pages/ProjectInfo.jsx:fetchProjects:error',message:'project list fetch failed',data:{userId:user?._id||null,status:err?.response?.status||null,message:err?.response?.data?.message||err?.message||'unknown'},timestamp:Date.now()})}).catch(()=>{});
      console.error("Error fetching projects:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to load projects. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', form);
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H5',location:'frontend/src/pages/ProjectInfo.jsx:handleCreateProject:success',message:'project info create success',data:{userId:user?._id||null,createdProjectId:res?.data?._id||null,status:res?.status||null},timestamp:Date.now()})}).catch(()=>{});
      setProjects([...projects, res.data]);
      setShowModal(false);
      
      setForm({
        projectName: "",
        description: "",
        status: "Planning",
        priority: "Medium",
        startDate: "",
        endDate: "",
        lead: ""
      });
    } catch (err) {
      fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'initial',hypothesisId:'H1',location:'frontend/src/pages/ProjectInfo.jsx:handleCreateProject:error',message:'project info create failed',data:{userId:user?._id||null,status:err?.response?.status||null,message:err?.response?.data?.message||err?.message||'unknown'},timestamp:Date.now()})}).catch(()=>{});
      console.error("Error creating project:", err);
      alert("Failed to create project");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Completed': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'; // Planning
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-600 dark:text-rose-400';
      case 'Medium': return 'text-amber-500 dark:text-amber-400';
      default: return 'text-emerald-500 dark:text-emerald-400';
    }
  };

  return (
    <div className=" flex h-screen bg-gray-50 dark:bg-gray-900 duration-200 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar searchTerm={searchTerm} onSearch={setSearchTerm} />
        
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="w-full md:w-auto text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight dark:text-white">Projects</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto md:mx-0">
                Manage, organize, and track your ongoing assignments.
              </p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="w-full md:w-auto py-3 md:py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl md:rounded-xl shadow-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New Project
            </button>
          </div>


          {loading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center mt-20 p-12 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-3xl text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Projects</h3>
              <p className="text-red-600 dark:text-red-300 max-w-sm mb-6">{error}</p>
              <button onClick={fetchProjects} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-all">
                Try Again
              </button>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <div 
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(project.status)} uppercase tracking-wider`}>
                      {project.status || 'Planning'}
                    </span>
                    <span className={`text-sm font-semibold flex items-center gap-1 ${getPriorityColor(project.priority)}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      {project.priority || 'Medium'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold dark:text-white mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">{project.projectName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 line-clamp-3">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                         {(project.lead || project.owner?.name || 'U').charAt(0).toUpperCase()}
                       </div>
                       <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                         {project.lead || project.owner?.name || 'Unassigned'}
                       </span>
                    </div>
                    
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No Deadline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-20 p-12 bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-center">
               <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/40 text-blue-500 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <h3 className="text-xl font-bold dark:text-white mb-2">No Projects Found</h3>
               <p className="text-gray-500 max-w-sm mb-6">
                 {searchTerm ? "No projects match your search criteria. Try a different keyword." : "You haven't created any projects yet. Start by creating a fresh assignment."}
               </p>
               {!searchTerm && (
                 <button 
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
                 >
                   Create First Project
                 </button>
               )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-5 mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={form.projectName}
                  onChange={e => setForm({...form, projectName: e.target.value})}
                  className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Provide a brief overview of the project's goals..."
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})} 
                    className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Planning">Planning 📝</option>
                    <option value="In Progress">In Progress 🚀</option>
                    <option value="Completed">Completed ✨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select 
                    value={form.priority} 
                    onChange={e => setForm({...form, priority: e.target.value})} 
                    className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Low">Low 🟢</option>
                    <option value="Medium">Medium 🟡</option>
                    <option value="High">High 🔴</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                   <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date (Deadline)</label>
                   <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Lead / Manager</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.lead}
                  onChange={e => setForm({...form, lead: e.target.value})}
                  className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Launch Project
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectInfo;