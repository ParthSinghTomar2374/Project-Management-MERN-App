import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LLogo from '../assets/LLogo.png';
import { ThemeContext } from '../context/ThemeContext';
import WelcomePage from './WelcomePage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };
   const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
     <div className='w-full items-center flex justify-between dark:bg-[#0A0A0A] flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'>
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
    <div className="flex items-center justify-center pt-16 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#0A0A0A] p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 ring-1 ring-black/5 dark:ring-white/5">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to track your issues
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input id="email-address" name="email" type="email" required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input id="password" name="password" type="password" required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <button type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
              Sign in
            </button>
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account? <Link to="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;
