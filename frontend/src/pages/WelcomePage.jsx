import React, { useState, useContext } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LLogo from '../assets/LLogo.png';
import { ThemeContext } from '../context/ThemeContext';
import DBI from '../assets/DBI.jpg';
import TeamManagement from '../assets/TeamManagement.png';
import Graph from '../assets/Graph.jpg';
import Bells from '../assets/Bells.jpg'
const WelcomePage = () => {
    const { toggleTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className='min-h-screen bg-white dark:bg-[#0A0A0A] flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8'>
            <div className='w-full px-6 items-center flex justify-between dark:bg-[#0A0A0A] relative'>
                <div className='nav-logo items-center pr-6'>
                   <img src={LLogo} alt="Logo" className='w-16 h-12 md:w-20 md:h-15 cursor-pointer hover:scale-105 transition' onClick={toggleTheme}/>
                </div>
                
                
                <div className='hidden md:flex gap-10 text-sm font-medium text-gray-700 tracking-wide '>
                    <a className='hover:text-black cursor-pointer dark:text-white' href='#products'>Products</a>
                    <a className='hover:text-black cursor-pointer dark:text-white' href='#partner'>Partners</a>
                    <a className='hover:text-black cursor-pointer dark:text-white' href='#Help'>Get Help</a> 
                </div>

                <div className='flex items-center gap-4'>
                    <div className='hidden sm:block bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition items-center'>
                        <button className='cursor-pointer border-5-pink'><Link to="/login">Get Started</Link></button>
                    </div>

                 
                    <div className='md:hidden flex items-center'>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className='text-gray-700 dark:text-white text-2xl focus:outline-none'
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

     
                {isMenuOpen && (
                    <div className='absolute top-full left-0 w-full bg-white dark:bg-[#1A1A1A] shadow-lg z-50 py-4 flex flex-col items-center gap-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-300'>
                        <a className='hover:text-black cursor-pointer dark:text-white py-2 w-full text-center border-b border-gray-100 dark:border-gray-800' href='#products' onClick={() => setIsMenuOpen(false)}>Products</a>
                        <a className='hover:text-black cursor-pointer dark:text-white py-2 w-full text-center border-b border-gray-100 dark:border-gray-800' href='#partner' onClick={() => setIsMenuOpen(false)}>Partners</a>
                        <a className='hover:text-black cursor-pointer dark:text-white py-2 w-full text-center border-b border-gray-100 dark:border-gray-800' href='#Help' onClick={() => setIsMenuOpen(false)}>Get Help</a>
                        <div className='sm:hidden bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition w-11/12 text-center'>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                        </div>
                    </div>
                )}
            </div>
            <div className='Introduction w-full flex flex-col items-center justify-center text-center py-24 px-6 '>
                <div className='intro-text text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-3xl dark:text-white leading-tight max-w-3xl'>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-3xl dark:text-white leading-tight max-w-3xl">
                     Powerful <span className="text-black  dark:text-white">Task</span><br />
                    Management Made <span className="text-orange-500">Simple</span>
                     </h1>
                      <p className="mt-6 text-gray-600 text-sm md:text-base max-w-xl dark:text-white leading-tight max-w-3xl">
                       Everything Your Team Needs to Stay Organized, Align Workflows, and
                       Move Faster with Confidence
                      </p>
                       <button 
                       className="mt-8 bg-gray-900 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition dark:text-black leading-tight dark:bg-white">
                        <Link to="/login">Book a Demo </Link> 
                       </button>

                     </div>
                <div className='intro-image pt-12'>
                    <img src={DBI} alt="" />
                </div>
            </div>
            <div className='Product-Cards dark:text-black ' id='products'>
                <div className='OurPro text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl pb-20 mx-auto text-center '>Our Products </div>
                <div className="secondBase max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
                <div className="card-a bg-white rounded-2xl shadow p-5 space-y-5 row-span-2 ">
                <h2 className="mem font-semibold dark:text-black">Membership</h2>
                <div className="mem dark:text-black">Join Our Membership for the lowest price and enjoy our services</div>
                <div className="mem space-y-3">
                    <div className="money items-center p-3 rounded-xl border hover:bg-gray-50">
                        <div className="two font-medium dark:text-black">
                            Monthly Youth
                    </div>                     
                       <div className="two text-sm text-gray-500 flex justify-between">
                        $200 per month, unlimited access to all features <span className="text-black dark:text-white">→</span>
                        </div>
                       
                    </div>
                    <div className="money items-center p-3 rounded-xl border hover:bg-gray-50">
                        <div className="two font-medium">
                            Monthly Audit
                    </div>                     
                       <div className="two text-sm text-gray-500 flex justify-between">
                        $200 per month, unlimited 18+
                        <span className="text-black dark:text-white">→</span>
                        </div>
                    </div>
                    <div className="money items-center p-3 rounded-xl border hover:bg-gray-50">
                        <div className="two text-sm font-medium">
                            Trial
                    </div>                     
                       <div className="two text-sm text-gray-500 flex justify-between">
                        $25 one-time
                        <span className="text-black dark:text-white">→</span>
                        </div>
                    </div>
                    <div className="money items-center p-3 rounded-xl border hover:bg-gray-50 ">
                        <div className="two text-sm font-medium">
                            Summer Camps
                    </div>                     
                       <div className="two text-sm text-gray-500 flex justify-between">
                        $499 per Year, unlimited access to all features
                        <span className="text-black dark:text-white">→</span>
                        </div>
                    </div>
                </div>
                </div>


                
                <div className="card-b bg-white rounded-2xl shadow p-5">
                    <div className="Roles space-y-3">
                        <div className="roles font-semibold">Permissions And Roles</div>
                        <div className="roles text-sm text-gray-500 flex justify-between">Assign any roles to any one as per your need form Public to Private Projects 
                            <br />Assign Unique Badges and Profile to the user 
                            <span className="text-black  dark:text-white">→</span>
                        </div>
                    </div>
                </div>
                <div className="card-c bg-white rounded-2xl shadow p-3">
                    <div className="team-management space-y-3">
                        <div className="tmanage font-semibold">
                            Team Management
                        </div>
                        <div className="tmanage text-sm text-gray-500 ">
                            Manage the teams as per your need and requriement and assign them task efficiently
                            <img src={TeamManagement} alt="" width={202} className='pt-4' />
                        </div>
                    </div>
                </div>
                <div className="card-d bg-white rounded-2xl shadow ">
                    <div className="reporting p-5">
                        <div className="treporting font-semibold pb-4">Reporting</div>
                        <div className="treporting text-sm text-gray-500 pb-5">Track, Manage and Store every report safely and securly 
                            
                        </div><img src={Graph} alt=""  width={202}/>
                    </div>
                </div>
                <div className="card-e bg-white rounded-2xl shadow p-5">
                    <div className="notification">
                        <div className="tnotification font-semibold pb-5">Notification</div>
                        <div className="tnotification text-sm text-gray-500 ">Advance Notification System that help you with every update and alert 
                            <img src={Bells} alt="" width={202} />
                        </div>
                    </div>
                </div>
                <div className="card-f bg-white rounded-2xl shadow p-5">
                    <div className="Boards">
                        <div className="tboards font-semibold">Boards & Viewes</div>
                        <div className="tboards text-sm text-gray-500 flex justify-between">We provide advance boards and views to track your tasks and projects and much more</div>
                    </div>
                </div>
                <div className="card-g bg-white rounded-2xl shadow p-5">
                    <div className="Schedule">
                        <div className="tschedule font-semibold">Schedule</div>
                        <div className="tschedule text-sm text-gray-500 flex justify-between">Advance Calander along with Deadline reminders and Scheduing Recurring Tasks System to manage your time and tasks efficiently</div>
                    </div>
                </div>
                <div className="card-h bg-white rounded-2xl shadow p-5">
                    <div className="Automation">
                        <div className="tautomation font-semibold">Automation</div>
                        <div className="tautomation text-sm text-gray-500 flex justify-between">Advance Automation System that helps you to automate your work and save time</div>
                    </div>
                </div>
            </div>
            
                </div>
                <div class="py-12 px-6">
  <div class="max-w-7xl mx-auto dark:text-white " id='partner'>

  
    <h2 class="text-4xl md:text-5xl font-bold text-gray-900  leading-tight max-w-3xl pb-20 mx-auto text-center dark:text-white ">
      Solution Partners
    </h2>

   
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ">

      
      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Bitlog</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Bitlog WMS</h3>
          <p class="text-sm text-gray-500 mt-1">
            The cloud-based, lightweight, easy-to-use, scalable WMS.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline ">
           E-Comm Platform  partner
          </a>
        </div>
      </div>

    
      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Dema.ai</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Dema.ai</h3>
          <p class="text-sm text-gray-500 mt-1">
            The AI-powered platform integrating fragmented e-comm data sources.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">blubolt</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">blubolt</h3>
          <p class="text-sm text-gray-500 mt-1">
            Designs, builds, and optimizes powerful Shopify Plus stores.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Ask Phill</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Ask Phill</h3>
          <p class="text-sm text-gray-500 mt-1">
            Helping brands scale and achieve global ambitions.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Limesharp</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Limesharp</h3>
          <p class="text-sm text-gray-500 mt-1">
            Redefining the future of e-commerce with leading brands.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Kindly</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Kindly</h3>
          <p class="text-sm text-gray-500 mt-1">
            The most user-friendly chatbot platform for enterprise.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Loqate</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Loqate</h3>
          <p class="text-sm text-gray-500 mt-1">
            The world's most trusted location data software.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Walley</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Walley</h3>
          <p class="text-sm text-gray-500 mt-1">
            Smarter, easier, and safer payments.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Voyado</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Voyado</h3>
          <p class="text-sm text-gray-500 mt-1">
            The CX platform that makes brands easy to love.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Proflog</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Proflog</h3>
          <p class="text-sm text-gray-500 mt-1">
            One of Sweden’s leading 3PL providers.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">ROIROI</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">ROIROI</h3>
          <p class="text-sm text-gray-500 mt-1">
            Leading e-comm agency for DTC brands.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Qliro</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Qliro</h3>
          <p class="text-sm text-gray-500 mt-1">
            Composable payment solutions for e-commerce.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

    </div>
  </div>
</div>
<div class=" py-12 px-6">
  <div class="max-w-7xl mx-auto">

    
    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 e leading-tight max-w-3xl pb-20 mx-auto text-center dark:text-white">
      E-Comm Platform Partners
    </h2>

  
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Bitlog</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Bitlog WMS</h3>
          <p class="text-sm text-gray-500 mt-1">
            The cloud-based, lightweight, easy-to-use, scalable WMS.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

    
      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Dema.ai</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Dema.ai</h3>
          <p class="text-sm text-gray-500 mt-1">
            The AI-powered platform integrating fragmented e-comm data sources.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      
      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Ask Phill</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Ask Phill</h3>
          <p class="text-sm text-gray-500 mt-1">
            Helping brands scale and achieve global ambitions.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Limesharp</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Limesharp</h3>
          <p class="text-sm text-gray-500 mt-1">
            Redefining the future of e-commerce with leading brands.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Kindly</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Kindly</h3>
          <p class="text-sm text-gray-500 mt-1">
            The most user-friendly chatbot platform for enterprise.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

     

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Loqate</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Loqate</h3>
          <p class="text-sm text-gray-500 mt-1">
            The world's most trusted location data software.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Walley</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Walley</h3>
          <p class="text-sm text-gray-500 mt-1">
            Smarter, easier, and safer payments.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Voyado</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Voyado</h3>
          <p class="text-sm text-gray-500 mt-1">
            The CX platform that makes brands easy to love.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Proflog</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Proflog</h3>
          <p class="text-sm text-gray-500 mt-1">
            One of Sweden’s leading 3PL providers.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

   

      <div class="space-y-4">
        <div class="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
          <span class="text-gray-500 text-sm">Qliro</span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">Qliro</h3>
          <p class="text-sm text-gray-500 mt-1">
            Composable payment solutions for e-commerce.
          </p>
          <a href="#" class="text-sm mt-2 inline-block text-gray-700 hover:underline">
            Visit partner
          </a>
        </div>
      </div>

    </div>
  </div>
</div> <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl pb-20 mx-auto text-center pt-12">
      Get Help
    </h2>
<footer class=" text-gray-800 dark:text-white">
  <div class="max-w-7xl mx-auto px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
      
    
      <div class="space-y-4" id='Help'>
    
        <ul class="space-y-2 font-medium">
          <li><a href="#" class="hover:underline">Company</a></li>
          <li><a href="#" class="hover:underline">Careers</a></li>
          <li><a href="#" class="hover:underline">Events</a></li>
          <li><a href="#" class="hover:underline">Blogs</a></li>
          <li><a href="#" class="hover:underline">Investor Relations</a></li>
          <li><a href="#" class="hover:underline">Our Foundation</a></li>
          <li><a href="#" class="hover:underline">Press kit</a></li>
          <li><a href="#" class="hover:underline">Contact us</a></li>
        </ul>
      </div>

     
      <div>
        <h3 class="text-sm font-semibold tracking-wide uppercase mb-4">
          Products
        </h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:underline">Automation</a></li>
          <li><a href="#" class="hover:underline">Team Management</a></li>
          <li><a href="#" class="hover:underline">Scheduling</a></li>
          <li><a href="#" class="hover:underline">Time Management</a></li>
          <li><a href="#" class="hover:underline">Notification</a></li>
          <li><a href="#" class="hover:underline">Professional Help</a></li>
          <li><a href="#" class="hover:underline">24 Hour Services</a></li>
          <li><a href="#" class="hover:underline">Easy Payments</a></li>
        </ul>
        <a href="#" class="inline-block mt-4 text-sm font-medium hover:underline">
          See all products →
        </a>
      </div>

     
      <div>
        <h3 class="text-sm font-semibold tracking-wide uppercase mb-4">
          Resources
        </h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:underline">Technical support</a></li>
          <li><a href="#" class="hover:underline">Purchasing & licensing</a></li>
          <li><a href="#" class="hover:underline">Our Community</a></li>
          <li><a href="#" class="hover:underline">Knowledge base</a></li>
          <li><a href="#" class="hover:underline">Marketplace</a></li>
          <li><a href="#" class="hover:underline">My account</a></li>
        </ul>
        <a href="#" class="inline-block mt-4 text-sm font-medium hover:underline">
          Create support ticket →
        </a>
      </div>

      <div>
        <h3 class="text-sm font-semibold tracking-wide uppercase mb-4">
          Learn
        </h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:underline">Partners</a></li>
          <li><a href="#" class="hover:underline">Training & certification</a></li>
          <li><a href="#" class="hover:underline">Documentation</a></li>
          <li><a href="#" class="hover:underline">Developer resources</a></li>
          <li><a href="#" class="hover:underline">Enterprise services</a></li>
        </ul>
        <a href="#" class="inline-block mt-4 text-sm font-medium hover:underline">
          See all resources →
        </a>
      </div>

    </div>
  </div>
</footer>
        </div>
    );
};

export default WelcomePage;
