import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/SideBar';
import Topbar from '../components/TopBar';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', priority: 'Medium', assignedTo: [] });

  const fetchData = async () => {
    try {
      const issueRes = await api.get(`/issues/${id}`);
      const issueData = issueRes.data;
      
      const pId = issueData.projectId?._id || issueData.projectId;

      const [commentsRes, activitiesRes, projRes] = await Promise.all([
        api.get(`/issues/${id}/comments`).catch(() => ({ data: [] })),
        api.get(`/issues/${id}/activities`).catch(() => ({ data: [] })),
        pId ? api.get(`/projects/${pId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null })
      ]);
      
      setIssue(issueData);
      setComments(commentsRes.data || []);
      setActivities(activitiesRes.data || []);
      setProject(projRes.data);
      
      setEditFormData({
        title: issueRes.data.title,
        description: issueRes.data.description || '',
        priority: issueRes.data.priority,
        assignedTo: Array.isArray(issueRes.data.assignedTo) 
          ? issueRes.data.assignedTo.map(u => u._id || u) 
          : (issueRes.data.assignedTo ? [issueRes.data.assignedTo._id || issueRes.data.assignedTo] : [])
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (e) => {
    try {
      const res = await api.put(`/issues/${id}`, { status: e.target.value });
      setIssue(res.data);
      const actRes = await api.get(`/issues/${id}/activities`);
      setActivities(actRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditIssue = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      
      const res = await api.put(`/issues/${id}`, payload);
      setIssue(res.data);
      setShowEditModal(false);
      
      const actRes = await api.get(`/issues/${id}/activities`);
      setActivities(actRes.data);
      fetchData(); 
    } catch (err) {
      console.error(err);
      alert('Failed to update issue');
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await api.delete(`/issues/${id}`);
      navigate(`/projects/${issue.projectId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete issue');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/issues/${id}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/issues/${id}/comments`, { commentText: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
      const actRes = await api.get(`/issues/${id}/activities`);
      setActivities(actRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/issues/${id}/ai-summary`);
      setAiSummary(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!issue) return <div className="text-center mt-20 text-xl font-medium text-gray-700">Issue not found</div>;

  const isOwner = project && project.owner && (project.owner._id === user?._id || project.owner === user?._id);
  const isCreator = issue.createdBy && (issue.createdBy._id === user?._id || issue.createdBy === user?._id);
  const isAssignee = issue.assignedTo && Array.isArray(issue.assignedTo) && issue.assignedTo.some(a => a._id === user?._id || a === user?._id);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const canEdit = isAdminOrManager || isOwner || isCreator || isAssignee;
  const canDelete = isAdminOrManager || isOwner || isCreator;
  const canChangeStatus = canEdit;

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar searchTerm={searchTerm} onSearch={setSearchTerm} />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{issue.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">Priority: {issue.priority}</span>
                <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium border border-blue-100 dark:border-blue-800/50 shadow-sm flex items-center gap-1">
                  Assigned To: 
                  {issue.assignedTo && Array.isArray(issue.assignedTo) && issue.assignedTo.length > 0 
                    ? issue.assignedTo.map(a => a.name).join(', ') 
                    : 'Unassigned'}
                </span>
                <span className="font-medium text-gray-600 dark:text-gray-400">Created by {issue.createdBy?.name || 'Unknown'}</span>
                <span>on {new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {canChangeStatus ? (
                <select value={issue.status} onChange={handleStatusChange} 
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm font-bold tracking-tight transition-colors">
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              ) : (
                <span className="bg-gray-100 dark:bg-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                  Status: {issue.status}
                </span>
              )}
              
              {canEdit && (
                <button onClick={() => setShowEditModal(true)} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0">
                  Edit
                </button>
              )}
              
              {canDelete && (
                <button onClick={handleDeleteIssue} className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold px-4 py-2.5 rounded-xl transition-colors border border-red-100 dark:border-red-800/50 shrink-0">
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="prose max-w-none text-gray-700 dark:text-gray-300 mt-8 leading-relaxed font-medium">
            <p>{issue.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 tracking-tight flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Insights
            </h3>
            <button onClick={handleGenerateAISummary} disabled={aiLoading || comments.length === 0} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {aiLoading ? 'Generating...' : 'Generate AI Summary'}
            </button>
          </div>
          {comments.length === 0 && !aiSummary && (
             <p className="text-sm text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30 font-medium tracking-tight">Add some comments to the discussion before generating an AI summary.</p>
          )}
          {aiSummary && (
            <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Summary</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{aiSummary.summary}</p>
              </div>
              {aiSummary.actionItems && aiSummary.actionItems.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Action Items</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {aiSummary.actionItems.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
              {aiSummary.nextStep && (
                <div className="bg-indigo-50/80 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100/80 dark:border-indigo-800/50">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-1 text-xs uppercase tracking-wider">Next Recommended Step</h4>
                  <p className="text-indigo-800 dark:text-indigo-400 font-medium text-sm">{aiSummary.nextStep}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Discussion ({comments.length})</h3>
          <div className="space-y-6 mb-8">
            {comments.map(comment => (
              <div key={comment._id} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-800">
                  {comment.userId?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 flex-1 rounded-2xl rounded-tl-none p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {comment.userId?.name || 'Unknown User'}
                      {comment.userId?._id === issue.createdBy?._id && <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full uppercase">Author</span>}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{new Date(comment.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {comment.userId?._id === user._id && (
                        <button onClick={() => handleDeleteComment(comment._id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete Comment">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{comment.commentText}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-medium bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">No comments yet. Start the discussion!</p>}
          </div>
          
          <form onSubmit={handleAddComment} className="mt-6 flex gap-4 items-end">
            <div className="flex-1 relative">
              <label htmlFor="comment" className="sr-only">Add your comment</label>
              <textarea id="comment" rows="3" required value={newComment} onChange={e => setNewComment(e.target.value)}
                className="block w-full rounded-xl border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border transition-all resize-none outline-none"
                placeholder="Write a comment..." />
            </div>
            <button type="submit" disabled={!newComment.trim()} className="bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
              Post Comment
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-fit lg:sticky lg:top-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-2">
           <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           Activity Timeline
        </h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent dark:before:from-gray-700">
          {activities.map((activity) => (
            <div key={activity._id} className="relative flex items-center pl-12 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold shadow-sm z-10 text-xs absolute left-0 ring-1 ring-black/5 dark:ring-white/5 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors">
                    {activity.userId?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="w-full bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm group-hover:border-blue-100 dark:group-hover:border-blue-500/30 transition-colors">
                    <div className="flex flex-col gap-1 mb-1">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{activity.userId?.name || 'Unknown User'}</div>
                        <div className="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">{activity.action}</div>
                    </div>
                    <time className="text-xs font-medium text-gray-400 dark:text-gray-500 block mt-2">{new Date(activity.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                </div>
            </div>
          ))}
          {activities.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm text-center relative z-10 bg-white dark:bg-gray-800 py-2">No activity logged yet.</p>}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-transparent dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Edit Issue</h3>
            <form onSubmit={handleEditIssue} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input required type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea rows="4" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                   <select value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm">
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                     <option>Critical</option>
                   </select>
                </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Assigned Members</label>
                    
                    {/* Current assignees as removable chips */}
                    {editFormData.assignedTo.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editFormData.assignedTo.map(uid => {
                          const u = project?.members?.find(u => u._id === uid);
                          return u ? (
                            <span key={uid} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                              {u.name}
                              <button
                                type="button"
                                onClick={() => setEditFormData({
                                  ...editFormData,
                                  assignedTo: editFormData.assignedTo.filter(id => id !== uid)
                                })}
                                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400 font-bold text-sm leading-none"
                                title={`Remove ${u.name}`}
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Dropdown to add new assignees */}
                    <select
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (val && !editFormData.assignedTo.includes(val)) {
                          setEditFormData({ ...editFormData, assignedTo: [...editFormData.assignedTo, val] });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
                    >
                      <option value="">+ Add assignee...</option>
                      {project?.members?.filter(u => !editFormData.assignedTo.includes(u._id)).map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
