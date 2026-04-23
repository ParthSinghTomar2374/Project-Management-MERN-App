import React, { useContext, useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from 'react-icons/fa';
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = ({ searchTerm, onSearch }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();


  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef();
  const notifRef = useRef();
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/WelcomePage");
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (projectId, notificationId) => {
    try {
      await api.post(`/projects/${projectId}/accept`);
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, read: true } : n));
      setNotifOpen(false);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (projectId, notificationId) => {
    try {
      await api.post(`/projects/${projectId}/decline`);
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamAccept = async (teamId, notificationId) => {
    try {
      await api.post(`/team/accept/${teamId}`);
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, read: true } : n));
      setNotifOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleTeamDecline = async (teamId, notificationId) => {
    try {
      await api.post(`/team/decline/${teamId}`);
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between md:justify-end px-6 shadow-sm gap-4 relative transition-all duration-300">

      {/* Search Bar - Desktop and Mobile Expanded */}
      <div className={`flex-1 flex items-center transition-all duration-300 ${isSearchOpen ? 'absolute inset-0 bg-white dark:bg-gray-800 z-50 px-4 py-2' : 'hidden md:flex'}`}>
        <div className="relative w-full flex items-center">
          <span className="absolute left-4 text-gray-400">
            <FaSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Search projects and tasks..."
            value={searchTerm !== undefined ? searchTerm : ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-3 md:py-2 border border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all shadow-sm text-base"
            autoFocus={isSearchOpen}
          />
          {isSearchOpen && (
            <button
              onClick={() => {
                setIsSearchOpen(false);
                onSearch && onSearch('');
              }}
              className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <FaTimes size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search Toggle - Mobile only when closed */}
      {!isSearchOpen && (
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-700 rounded-xl"
        >
          <FaSearch size={22} />
        </button>
      )}

      <div className={`flex items-center gap-4 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="relative mr-2" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed md:absolute top-20 md:top-auto left-4 right-4 md:left-auto md:right-0 md:mt-3 md:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && markAsRead(n._id)}
                      className={`block w-full text-left p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${n.read ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                    >
                      <div className="flex gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-900 dark:text-white flex-wrap ${n.read ? '' : 'font-semibold'}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                          {n.type === 'invitation' && !n.read && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAccept(n.projectId?._id, n._id); }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDecline(n.projectId?._id, n._id); }}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {n.type === 'team_invitation' && !n.read && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTeamAccept(n.teamId?._id || n.teamId, n._id); }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                              >
                                Join Team
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTeamDecline(n.teamId?._id || n.teamId, n._id); }}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>

          <div
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer font-semibold bg-cover bg-center overflow-hidden ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all active:scale-95"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              firstLetter
            )}
          </div>

          {open && (
            <div className="fixed md:absolute top-20 md:top-auto left-4 right-4 md:left-auto md:right-0 md:mt-3 md:w-[280px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-300">

              <div className="p-5 bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 overflow-hidden shadow-lg border-2 border-white dark:border-gray-600">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold">{firstLetter}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-2xl transition-colors text-gray-700 dark:text-gray-200 font-semibold text-sm group"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  Manage account
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors text-gray-700 dark:text-gray-200 font-semibold text-sm group"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 group-hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </div>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div></div>
  );
};

export default Topbar;