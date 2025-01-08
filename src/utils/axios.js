import axios from 'axios';
import { toast } from 'src/components/snackbar';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error response
    const errorMessage = error.response?.data?.detail || 'Something went wong!';
    const errorStatus = error.response?.status;

    if (errorStatus === 400) {
      toast.error(`${errorMessage}`, {
        autoClose: 5000,
      });
    } else if (errorStatus === 500) {
      toast.error('Server Error. Please try again later.', {
        autoClose: 5000,
      });
    } else if (errorStatus === 401) {
      toast.error(`${errorMessage}`, {
        autoClose: 5000,
      });
    } else if (error.response?.status === 0) {
      toast.error('Network Error. Please check your internet connection.', {
        autoClose: 5000,
      });
    }

    // Reject the promise to propagate the error
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: `${process.env.REACT_APP_DEBUG === "true" ? process.env.REACT_APP_TEST_SERVER_URL : process.env.REACT_APP_PROD_SERVER_URL}/user/`,
    signIn: `${process.env.REACT_APP_DEBUG === "true" ? process.env.REACT_APP_TEST_SERVER_URL : process.env.REACT_APP_PROD_SERVER_URL}/login/`,
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: `${process.env.REACT_APP_DEBUG === "true" ? process.env.REACT_APP_TEST_SERVER_URL : process.env.REACT_APP_PROD_SERVER_URL}/list/product/`,
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
