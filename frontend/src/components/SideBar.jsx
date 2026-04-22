import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

import LLogo from "../assets/LLogo.png";
import home from "../assets/home.svg";
import chat from "../assets/chat.svg";
import teams from "../assets/teams.svg";
import setting from "../assets/setting.svg";
import projects from "../assets/projects.svg";
import tickbox from "../assets/tickbox.svg";
import graph from "../assets/graph.svg";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
   const { theme, toggleTheme } = useContext(ThemeContext);

  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        if (!user) return;
        const res = await api.get('/issues?assignedTo=me');
        const issues = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.issues)
            ? res.data.issues
            : [];
        
        setMyTasks(issues.filter(t => t.status !== 'Done' && t.status !== 'Completed'));
      } catch (err) {
        console.error("Failed to fetch sidebar tasks", err);
      }
    };
    fetchMyTasks();
  }, [user]);

  return (
    <div className="w-64 bg-white dark:bg-gray-800 flex flex-col h-full shadow-sm border-r border-gray-100 dark:border-gray-700">
      
      <div className="p-4 flex justify-center mt-2">
        <img
          src={LLogo}
          alt="logo"
          className="w-24 cursor-pointer transition-transform hover:scale-105"
          
          onClick={toggleTheme}
        />
      </div>

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 mb-2">
        <div className="font-bold text-gray-900 dark:text-white capitalize truncate">
          {user?.name || "Workspace"}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 w-fit px-2 py-0.5 rounded-full mt-1.5 font-bold tracking-wide">
          {user?.role || "Member"}
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1.5 mt-3 ">
        <SidebarItem  icon={home }  label="Home" active={location.pathname === "/HomePage"} onClick={() => navigate("/HomePage")}  />
        <SidebarItem icon={graph} label="Analytics" active={location.pathname === "/Analytics"} onClick={() => navigate("/Analytics")} />
        <SidebarItem icon={teams} label="Team" active={location.pathname === "/TeamMemb"} onClick={() => navigate("/TeamMemb")} />
        <SidebarItem icon={projects} label="Projects" active={location.pathname === "/ProjectInfo"} onClick={() => navigate("/ProjectInfo")} />
        
        
        <div className="mt-2">
          <div 
            onClick={() => setIsTaskOpen(!isTaskOpen)}
            className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all ${isTaskOpen ? 'bg-blue-50/70 dark:bg-gray-700/70' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <div className="flex items-center gap-3">
              <img src={tickbox} alt="My Task" className={`w-5 h-5 transition-opacity ${isTaskOpen ? 'opacity-100' : 'opacity-70'}`} />
              <span className={`font-semibold ${isTaskOpen ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>My Tasks</span>
            </div>
            {myTasks.length > 0 && !isTaskOpen && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1">
                {myTasks.length}
              </span>
            )}
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isTaskOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          
        
          <div className={`overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${isTaskOpen ? 'opacity-100 mt-2 max-h-56' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="pl-11 pr-2 pb-2 space-y-1.5">
              {myTasks && myTasks.length > 0 ? (
                myTasks.map(task => (
                  <div 
                    key={task._id} 
                    onClick={() => navigate(`/issues/${task._id}`)}
                    className="text-sm px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-all line-clamp-1 border border-transparent shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
                    <span className="truncate">{task.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-center text-gray-400 dark:text-gray-500 px-3 py-3 italic bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  No active tasks right now.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      
      <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700">
        <SidebarItem icon={setting} label="Settings" active={location.pathname === "/settings"} onClick={() => navigate("/settings")} />
      </div>

    </div>
  );
};

export default Sidebar;

const SidebarItem = ({ icon, label, onClick, active }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
        active 
          ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400 shadow-sm" 
          : "border-l-4 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <img src={icon} alt={label} className={`w-5 h-5 transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`} />
      <span className={`font-semibold ${active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
    </div>
  );
};