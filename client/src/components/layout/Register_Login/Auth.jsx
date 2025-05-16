import { useForm } from 'react-hook-form';
import { useContext, useState } from 'react';
import createUser from '../../../helpers/createUser.js';
import loginUser from '../../../helpers/loginUser.js';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  
  const { setAuth } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (!isLogin) {
        // Register
        const response = await createUser({
          username: data.username,
          email: data.email,
          password: data.password
        });
        
        if (response?.status === 201) {
          toast.success('Account created successfully!');
          setIsLogin(true);
          reset();
        } else {
          throw new Error(response?.data?.message || 'Failed to create account');
        }
      } else {
        // Login
        const user = await loginUser({
          username: data.username,
          password: data.password
        });
        
        if (!user) throw new Error('Invalid login credentials');
        
        setAuth(user);
        toast.success('Logged in successfully!');
        setTimeout(() => navigate(from, { replace: true }), 1500);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <ToastContainer />
      
      <div className="w-full max-w-md bg-white  rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 d mb-4">
          {isLogin ? 'Login to Your Account' : 'Create a New Account'}
        </h2>
        
        {/* Simple toggle button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleAuthMode}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
              type="text"
              placeholder="Enter your username"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 4,
                  message: 'Username must be at least 4 characters'
                }
              })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
          
          {/* Email field - only show for registration */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 d"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          )}
          
          {/* Password field */}
          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 d"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 7,
                    message: 'Password must be at least 7 characters'
                  }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {/* Confirm Password - only show for registration */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 d"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('repeatPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watch('password') || 'Passwords do not match'
                })}
              />
              {errors.repeatPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.repeatPassword.message}</p>
              )}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;