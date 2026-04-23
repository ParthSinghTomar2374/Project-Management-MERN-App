import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaTimes } from 'react-icons/fa';
import Sidebar from "../components/SideBar";
import Topbar from "../components/TopBar";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const TeamMemb = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [team, setTeam] = useState(null);
  const [memberOfTeams, setMemberOfTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [inviteResults, setInviteResults] = useState([]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const [myTeamRes, memberOfRes] = await Promise.all([
        api.get('/team'),
        api.get('/team/member-of').catch(() => ({ data: [] }))
      ]);
      setTeam(myTeamRes.data);
      setMemberOfTeams(Array.isArray(memberOfRes.data) ? memberOfRes.data : []);
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const addEmailToList = (e) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    // basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError('Please enter a valid email address');
      return;
    }
    if (emailList.includes(email)) {
      setInviteError('That email is already in the list');
      return;
    }
    setEmailList([...emailList, email]);
    setEmailInput("");
    setInviteError("");
  };

  const removeEmailFromList = (email) => {
    setEmailList(emailList.filter(e => e !== email));
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (emailList.length === 0) {
      setInviteError('Add at least one email address');
      return;
    }
    setInviteError("");
    setInviteResults([]);
    setInviting(true);

    const results = [];
    for (const email of emailList) {
      try {
        await api.post('/team/invite', { email });
        results.push({ email, ok: true, msg: 'Invitation sent!' });
      } catch (err) {
        results.push({ email, ok: false, msg: err.response?.data?.message || 'Failed' });
      }
    }

    setInviteResults(results);
    setEmailList([]);
    setInviting(false);
    fetchTeam();
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from your team?")) return;
    try {
      const res = await api.delete(`/team/members/${userId}`);
      setTeam(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const ownedMembers = team?.members || [];

  const joinedMembers = memberOfTeams.flatMap(t => [
    ...(t.owner ? [t.owner] : []),
    ...(t.members || [])
  ]);

  const allMembersMap = new Map();
  [...ownedMembers, ...joinedMembers].forEach(m => {
    if (m && m._id && m._id !== currentUser?._id) {
      allMembersMap.set(m._id, m);
    }
  });
  const allMembers = Array.from(allMembersMap.values());

  const pending = team?.pendingInvitations || [];

  const filteredMembers = allMembers.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />

          <div className="p-8 bg-gray-50 dark:bg-gray-900 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold dark:text-white">My Team</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Invite people to your team — they must accept before joining
                </p>
              </div>
              <button
                onClick={() => { setShowInviteModal(true); setInviteError(""); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Invite Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Team Members</h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{allMembers.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Pending Invitations</h4>
                <p className="text-3xl font-bold text-yellow-500">{pending.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 relative">
              {/* Desktop Search */}
              <div className="hidden md:flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl px-4 py-3 w-full md:w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500">
                <FaSearch className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full outline-none bg-transparent dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Mobile Search Toggle */}
              {!isSearchOpen && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-gray-500 hover:bg-gray-200 transition-all active:scale-95"
                >
                  <FaSearch size={22} />
                </button>
              )}

              {/* Mobile Search Expanded */}
              {isSearchOpen && (
                <div className="md:hidden flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl px-5 py-3 w-full animate-in fade-in slide-in-from-top-4 duration-300">
                  <FaSearch className="text-gray-400 mr-3" size={20} />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full outline-none bg-transparent dark:text-white placeholder-gray-400 text-lg"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="ml-3 text-gray-400 p-1">
                    <FaTimes size={20} />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {filteredMembers.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Member</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Email</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Role</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredMembers.map(member => (
                          <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase shrink-0 overflow-hidden">
                                  {member.profilePicture ? (
                                    <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                  ) : member.name?.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{member.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-md uppercase">
                                {member.role || 'user'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRemove(member._id)}
                                disabled={team?.owner?._id !== currentUser?._id && team?.owner !== currentUser?._id}
                                className={`text-sm font-medium px-3 py-1 rounded-md border transition-colors ${(team?.owner?._id === currentUser?._id || team?.owner === currentUser?._id)
                                    ? 'text-red-500 hover:text-red-700 border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                  }`}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold dark:text-white mb-2">No team members yet</h2>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm ? "No members match your search." : "Invite people to your team using their email. They'll receive a notification to accept or decline."}
                    </p>
                  </div>
                )}

                {pending.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-100 dark:border-yellow-900/30 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-yellow-100 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pending Invitations ({pending.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {pending.map(p => (
                        <div key={p._id} className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {p.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.email}</p>
                          </div>
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                            Awaiting response
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {memberOfTeams.length > 0 && (
                  <div className="space-y-6 mt-8">
                    <h2 className="text-2xl font-bold dark:text-white">Teams I've Joined</h2>
                    {memberOfTeams.map(t => (
                      <div key={t._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Team Owner</span>
                            <h3 className="font-bold text-gray-900 dark:text-white">{t.owner?.name}'s Team</h3>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-700">
                            Member
                          </span>
                        </div>
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Teammates ({t.members.length})</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {t.members.map(m => (
                              <div key={m._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                  {m.profilePicture ? (
                                    <img src={m.profilePicture} alt={m.name} className="w-full h-full object-cover rounded-full" />
                                  ) : m.name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name} {m._id === currentUser._id && "(You)"}</p>
                                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Invite to Your Team</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Add one or more email addresses, then send all invitations at once.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setInviteError(""); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmailToList(e); } }}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={addEmailToList}
                className="px-4 py-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors text-sm shrink-0"
              >
                + Add
              </button>
            </div>

            {emailList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                {emailList.map(email => (
                  <span key={email} className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmailFromList(email)}
                      className="text-blue-500 hover:text-red-500 font-bold text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {inviteError && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 mb-3">
                {inviteError}
              </div>
            )}

            {inviteResults.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {inviteResults.map(r => (
                  <div key={r.email} className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${r.ok
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    <span>{r.ok ? '✓' : '✗'}</span>
                    <span className="font-medium">{r.email}</span>
                    <span className="text-xs opacity-75">— {r.msg}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteError(""); setEmailInput(""); setEmailList([]); setInviteResults([]); }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
              >
                {inviteResults.length > 0 ? 'Close' : 'Cancel'}
              </button>
              {inviteResults.length === 0 && (
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={inviting || emailList.length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  {inviting ? `Sending ${emailList.length}...` : `Send ${emailList.length > 1 ? `${emailList.length} Invites` : 'Invite'}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamMemb;