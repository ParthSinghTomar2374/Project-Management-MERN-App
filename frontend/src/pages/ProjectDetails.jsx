import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/SideBar';
import Topbar from '../components/TopBar';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'Medium', assignedTo: [] });

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, issRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/issues`)
      ]);
      setProject(projRes.data);
      setIssues(issRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const issuePayload = { ...newIssue };
      
      
      const res = await api.post(`/projects/${id}/issues`, issuePayload);
      setIssues([...issues, res.data]);
      setShowModal(false);
      setNewIssue({ title: '', description: '', priority: 'Medium', assignedTo: [] });
      fetchData(); // Refetch project to update member list if auto-added
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      const res = await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setProject(res.data);
      setShowAddMemberModal(false);
      setNewMemberEmail('');
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? All issues will also be orphaned or deleted. This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the project?")) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!project) return <div className="text-center mt-20 text-xl font-medium text-gray-700">Project not found</div>;

  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedIssues = {
    'Todo': filteredIssues.filter(i => i.status === 'Todo'),
    'In Progress': filteredIssues.filter(i => i.status === 'In Progress'),
    'Done': filteredIssues.filter(i => i.status === 'Done'),
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar searchTerm={searchTerm} onSearch={setSearchTerm} />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 md:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{project.projectName}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{project.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              {project.members && project.members.map((member) => (
                <div key={member._id} className="relative group inline-block">
                  <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm" title={member.name}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  {project.owner && (project.owner._id === user._id || project.owner === user._id) && member._id !== (project.owner._id || project.owner) && (
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 focus:outline-none shadow-sm"
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {project.pendingMembers && project.pendingMembers.map((member) => (
                <div key={member._id} className="relative group inline-block opacity-60">
                  <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-400 text-white flex items-center justify-center text-xs font-bold border border-dashed border-gray-500" title={`${member.name} (Pending Invitation)`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full border border-white dark:border-gray-800" title="Pending"></div>
                </div>
              ))}
            </div>
            {project.owner && (project.owner._id === user._id || project.owner === user._id) && (
              <div className="flex gap-2">
                <button onClick={() => setShowAddMemberModal(true)} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50 uppercase tracking-wide">
                  + Invite
                </button>
                <button onClick={() => setShowManageMembersModal(true)} className="text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 uppercase tracking-wide">
                  Team
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {project.owner && (project.owner._id === user._id || project.owner === user._id) && (
            <button onClick={handleDeleteProject} className="flex-1 md:flex-none bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-sm border border-red-100 dark:border-red-800/50 active:scale-95 text-sm">
              Delete
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="flex-[2] md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm">
            <span>+</span> New Issue
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-scrollbar snap-x snap-mandatory">
        <div className="flex gap-5 h-full min-w-max px-1">
          {Object.keys(groupedIssues).map(status => (
            <div key={status} className="w-[85vw] md:w-80 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl flex flex-col p-4 border border-gray-200 dark:border-gray-700 shadow-sm snap-center">
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-[11px] tracking-widest">{status}</h3>
                <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                  {groupedIssues[status].length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                {groupedIssues[status].map(issue => (
                  <Link key={issue._id} to={`/issues/${issue._id}`} className="block block group">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 leading-snug">{issue.title}</h4>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getPriorityColor(issue.priority)} dark:bg-opacity-20 dark:border-opacity-20`}>
                          {issue.priority}
                        </span>
                        {issue.assignedTo && Array.isArray(issue.assignedTo) && issue.assignedTo.length > 0 ? (
                          <div className="flex -space-x-1 overflow-hidden">
                            {issue.assignedTo.map((assignee, idx) => (
                              <div key={assignee._id || idx} className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold border border-white dark:border-gray-800" title={assignee.name}>
                                {assignee.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            ))}
                          </div>
                        ) : (
                           <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Unassigned</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {groupedIssues[status].length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                    No issues
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-transparent dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Create New Issue</h3>
            <form onSubmit={handleCreateIssue} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input required type="text" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" placeholder="e.g. Broken authentication flow" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea rows="4" value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" placeholder="Details about this issue..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                   <select value={newIssue.priority} onChange={e => setNewIssue({...newIssue, priority: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm">
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                     <option>Critical</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Assign To</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hold Ctrl/Cmd to select multiple</p>
                    <select multiple value={newIssue.assignedTo} onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setNewIssue({...newIssue, assignedTo: values});
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm h-32 custom-scrollbar">
                     {project.members && project.members.map(m => (
                       <option key={m._id} value={m._id} className="py-1">{m.name}</option>
                     ))}
                   </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-sm">Create Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-transparent dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Invite Project Member</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the email address of the user you want to invite to this project. They will need to accept the invitation to join.</p>
            <form onSubmit={handleAddMember} className="space-y-4">
              {memberError && <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded-lg border border-red-100 dark:border-red-900/50">{memberError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">User Email</label>
                <input required type="email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" placeholder="colleague@example.com" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => {setShowAddMemberModal(false); setMemberError('');}} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-sm">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showManageMembersModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-transparent dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Team</h3>
              <button onClick={() => setShowManageMembersModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Members</h4>
                {project.members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{member.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{member.email}</p>
                      </div>
                    </div>
                    {project.owner && project.owner._id === user._id && member._id !== project.owner._id && (
                      <button 
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    {member._id === project.owner._id && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase">Owner</span>
                    )}
                  </div>
                ))}
              </div>

              {project.pendingMembers && project.pendingMembers.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Invitations</h4>
                  {project.pendingMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 text-white flex items-center justify-center text-xs font-bold shadow-sm border border-dashed border-gray-400">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{member.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{member.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 px-2 py-1 rounded transition-colors"
                        title="Cancel Invitation"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setShowManageMembersModal(false)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
