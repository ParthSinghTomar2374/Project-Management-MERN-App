import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LLogo from '../assets/LLogo.png';
import { ThemeContext } from '../context/ThemeContext';


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };   const { theme, toggleTheme } = useContext(ThemeContext);


  return (
    <>
     <div className='w-full pb-10 items-center flex justify-between dark:bg-[#0A0A0A] flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'>
                      <div className='nav-logo items-center pr-6'>
                         <img src={LLogo} alt="" className='w-20 h-15 cursor-pointer hover:scale-105 transition' onClick={toggleTheme}/>
                      
                      </div>
                      
                      <div className='flex gap-10 text-sm font-medium text-gray-700 tracking-wide '>
                     <Link className='hover:text-black cursor-pointer dark:text-white' to='/WelcomePage#products'>Products</Link>
                                           <Link className='hover:text-black cursor-pointer dark:text-white' to='/WelcomePage#partner'>Partners</Link>
                                           <Link className='hover:text-black cursor-pointer dark:text-white' to='/WelcomePage#Help'>Get Help</Link> 
                      </div>
                      <div className='bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition items-center flex gap-6'>
                          <button className='cursor-pointer border-5-pink'><Link to="/login">Get Started</Link></button>
                          
                      </div>
                  </div>
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4 font-sans">
      
      

      
      <div className="w-full max-w-md">
        
        <div className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 pt-12 pb-10 px-10">
          
         
          <div className="text-center mb-10">
            <h2 className="text-[34px] font-normal text-gray-900 dark:text-white mb-3 tracking-tight">Sign up</h2>
            <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Sign up to continue</p>
          </div>

          
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            
            <div className="space-y-7">
              <input 
                type="text" 
                placeholder="Name" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full appearance-none bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 px-0 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 text-[15px] transition-colors"
              />
              <input 
                type="email" 
                placeholder="Email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full appearance-none bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 px-0 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 text-[15px] transition-colors"
              />
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full appearance-none bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 px-0 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 text-[15px] transition-colors"
              />
            <select className="w-full appearance-none bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 px-0 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 text-[15px] transition-colors" 
            value={role}
            onChange={(e)=> setRole(e.target.value)}
            required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>




            </div>

            <button 
              type="submit"
              className="w-full bg-[#1877F2] hover:bg-blue-600 text-white font-medium py-3 rounded text-[15px] transition-colors shadow-sm"
            >
              Sign up
            </button>

            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[18px] w-[18px] text-[#1877F2] bg-white border-gray-300 rounded focus:ring-2 focus:ring-[#1877F2]/30 cursor-pointer" 
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-[14px] font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                Remember me
              </label>
            </div>
          </form>

   
          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 font-bold tracking-wider">ACCESS QUICKLY</span>
            </div>
          </div>

          
          <div className="mt-8 grid grid-cols-3 gap-3">
            <button type="button" className="flex justify-center items-center py-2 px-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded text-[13px] font-bold text-[#1877F2] hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              Google
            </button>
            <button type="button" className="flex justify-center items-center py-2 px-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded text-[13px] font-bold text-[#1877F2] hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              Linkedin
            </button>
            <button type="button" className="flex justify-center items-center py-2 px-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded text-[13px] font-bold text-[#1877F2] hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              SSO
            </button>
          </div>

        </div>
        
        
        <div className="text-center mt-6 text-[13px] text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-[#1877F2] font-medium hover:underline ml-1 cursor-pointer">Sign in</Link>
        </div>
      </div>
    </div>
    </>
  );
};
 export default Signup;
