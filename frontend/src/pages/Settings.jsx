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

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex justify-center">
          <div className="w-full max-w-5xl flex gap-8 h-fit pb-12">
            
            <div className="w-64 shrink-0 mt-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Account</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">Manage your account info.</p>
              
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-gray-200/60 dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <FiUser className="w-5 h-5" />
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'security' 
                      ? 'bg-gray-200/60 dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <FiShield className="w-5 h-5" />
                  Security
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px]">
              
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Profile details</h3>
                  
                  <div className="flex items-center justify-between py-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Profile</span>
                    </div>
                    <div className="w-1/3 flex items-center gap-4">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-800" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white dark:border-gray-800">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{user?.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'user'}</span>
                      </div>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                         {isEditingProfile ? 'Cancel' : 'Update profile'}
                      </button>
                    </div>
                  </div>

                  {isEditingProfile && (
                     <form onSubmit={handleProfileUpdate} className="py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 -mx-8 px-8 mb-4">
                        <div className="max-w-md space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                            <select value={profileForm.role} onChange={e => setProfileForm({...profileForm, role: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white cursor-pointer">
                              <option value="user">User</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                            <div className="flex items-center gap-4">
                              {profileForm.profilePicture ? (
                                <img src={profileForm.profilePicture} alt="Preview" className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200" />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                  <FiUser size={24} />
                                </div>
                              )}
                              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                          </div>
                          <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50">Save Changes</button>
                        </div>
                     </form>
                  )}

                  <div className="flex items-start justify-between py-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Email addresses</span>
                    </div>
                    <div className="w-1/3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 dark:text-gray-200 font-medium">{user?.email}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Primary</span>
                      </div>
                      <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors w-fit mt-2">
                         <FiPlus /> Add email address
                      </button>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"><FiMoreHorizontal size={20} /></button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between py-6">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Connected accounts</span>
                    </div>
                    <div className="w-1/3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">Google</span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm truncate max-w-[200px] ml-1">· {user?.email}</span>
                      </div>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"><FiMoreHorizontal size={20} /></button>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Security</h3>

                  <div className="flex items-start justify-between py-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Password</span>
                    </div>
                    <div className="w-2/3">
                      {!isEditingPassword ? (
                         <button onClick={() => setIsEditingPassword(true)} className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors">
                           Set password
                         </button>
                      ) : (
                         <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                            <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                               <input type="password" required value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                               <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div className="flex gap-3 mt-4">
                               <button type="button" onClick={() => setIsEditingPassword(false)} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold shadow-sm transition-colors">Cancel</button>
                               <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50">Save Password</button>
                            </div>
                         </form>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between py-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Active devices</span>
                    </div>
                    <div className="w-2/3 flex items-start gap-4">
                      <div className="mt-1 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                         <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20h6l-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-gray-900 dark:text-white">Windows</span>
                           <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold border border-gray-200 dark:border-gray-600">This device</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{activeDevice.split(' ')[0] || "Chrome 120.0.0.0"}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Current Session (Delhi, IN)</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between py-6">
                    <div className="w-1/3">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Delete account</span>
                    </div>
                    <div className="w-2/3">
                      <button onClick={handleDeleteAccount} disabled={loading} className="text-sm font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50">
                        Delete account
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
