import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/SideBar';
import Topbar from '../components/TopBar';
import { FiUser, FiShield, FiMoreHorizontal, FiPlus, FiLogOut } from 'react-icons/fi';

const Settings = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '', profilePicture: '', role: 'user' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', profilePicture: user.profilePicture || '', role: user.role || 'user' });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert('File is too large! Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      return alert("Passwords don't match");
    }
    try {
      setLoading(true);
      await api.put('/auth/password', { password: passwordForm.password });
      setIsEditingPassword(false);
      setPasswordForm({ password: '', confirmPassword: '' });
      alert('Password updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await api.delete('/auth/account');
      logout();
      navigate('/WelcomePage');
    } catch (err) {
      console.error(err);
      alert('Failed to delete account');
      setLoading(false);
    }
  };

  const activeDevice = navigator.userAgent;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Account Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your profile, security and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Settings Navigation */}
              <div className="w-full lg:w-72 shrink-0 space-y-1 bg-white dark:bg-gray-800 p-3 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiUser className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`} />
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === 'security' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiShield className={`w-5 h-5 ${activeTab === 'security' ? 'text-white' : 'text-gray-400'}`} />
                  Security
                </button>
                
                <div className="my-4 border-t border-gray-100 dark:border-gray-700" />
                
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                  <FiLogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>

              {/* Settings Content */}
              <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {activeTab === 'profile' && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profile Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Update your personal details and how others see you.</p>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-gray-700" />
                          ) : (
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white dark:border-gray-700">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <FiPlus className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{user?.role || 'user'}</span>
                            <span>•</span>
                            <span>{user?.email}</span>
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isEditingProfile ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100 dark:shadow-none'}`}>
                         {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>

                    {isEditingProfile && (
                       <form onSubmit={handleProfileUpdate} className="py-8 px-8 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl mb-8 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                          <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                                <div className="flex items-center gap-6">
                                  <div className="relative">
                                    {profileForm.profilePicture ? (
                                      <img src={profileForm.profilePicture} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-gray-600 shadow-md" />
                                    ) : (
                                      <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                        <FiUser size={24} />
                                      </div>
                                    )}
                                  </div>
                                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                                </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all" placeholder="Enter your name" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Workspace Role</label>
                              <select value={profileForm.role} onChange={e => setProfileForm({...profileForm, role: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white cursor-pointer transition-all">
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <div className="md:col-span-2 pt-2">
                              <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Profile Changes'}
                              </button>
                            </div>
                          </div>
                       </form>
                    )}

                    <div className="space-y-8 mt-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="max-w-md">
                          <span className="block font-bold text-gray-900 dark:text-white mb-1">Email addresses</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">The email address associated with your account.</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                              </div>
                              <span className="text-gray-800 dark:text-gray-200 font-bold">{user?.email}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">Primary</span>
                          </div>
                          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors w-fit">
                             <FiPlus className="w-4 h-4" /> Add secondary email
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="max-w-md">
                          <span className="block font-bold text-gray-900 dark:text-white mb-1">Connected accounts</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in with your favorite platforms.</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-800 dark:text-gray-200 font-bold">Google</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Connected as {user?.email}</span>
                              </div>
                            </div>
                            <button className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">Disconnect</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Security & Access</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage your password and active sessions.</p>

                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 py-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="max-w-md">
                        <span className="block font-bold text-gray-900 dark:text-white mb-1">Password</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Regularly updating your password increases security.</p>
                      </div>
                      <div className="flex-1 max-w-lg">
                        {!isEditingPassword ? (
                           <button onClick={() => setIsEditingPassword(true)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                             Change password
                           </button>
                        ) : (
                           <form onSubmit={handlePasswordUpdate} className="space-y-4 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                 <input type="password" required value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all" />
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                 <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all" />
                              </div>
                              <div className="flex gap-3 pt-2">
                                 <button type="button" onClick={() => setIsEditingPassword(false)} className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
                                 <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50">
                                   Update Password
                                 </button>
                              </div>
                           </form>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 py-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="max-w-md">
                        <span className="block font-bold text-gray-900 dark:text-white mb-1">Active sessions</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Devices where you are currently logged in.</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20h6l-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-gray-900 dark:text-white">Windows PC</span>
                               <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-200 dark:border-blue-800/50">Active Now</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{activeDevice.split(' ')[0] || "Chrome 120.0"}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Delhi, India • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 py-8 border-t border-red-100 dark:border-red-900/20 mt-8">
                      <div className="max-w-md">
                        <span className="block font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
                      </div>
                      <div className="flex-1">
                        <button onClick={handleDeleteAccount} disabled={loading} className="px-5 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 border border-red-100 dark:border-red-900/30">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div> </div>
  );
};

export default Settings;
