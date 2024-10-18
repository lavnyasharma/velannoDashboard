import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';


import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Correct method to retrieve username from localStorage
        const username = localStorage.getItem('username');

        if (username) {
          // Make API call with username and accessToken
          const res = await axios.get(`${endpoints.auth.me}${username}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Pass the token in the Authorization header
            },
          });

          const { user, role } = res.data;
          if (role === "customer") {
            toast.error("You are not authorized to access this resource ")

            localStorage.removeItem("username")
            await signOut()

          }
          else {
            localStorage.setItem("role", role)
          }


          setState({ user: { ...user, accessToken,role }, loading: false });
        } else {
          console.error("Username not found in localStorage");
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error("Error during API call:", error);
      setState({ user: null, loading: false });
    }
  }, [setState]);


  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
          ...state.user,
          role: state.user?.role ?? 'admin',
        }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );
  console.log(memoizedValue)

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
