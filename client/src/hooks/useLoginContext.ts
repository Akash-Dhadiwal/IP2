import { useContext } from 'react';
import LoginContext from '../contexts/LoginContext';

export const useLoginContext = () => {
  const context = useContext(LoginContext);
  if (context === null) {
    throw new Error('LoginContext is null. Make sure it is provided correctly.');
  }
  return context;
};

export default useLoginContext;
