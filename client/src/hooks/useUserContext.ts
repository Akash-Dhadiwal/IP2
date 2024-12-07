import { useContext } from 'react';
import UserContext from '../contexts/UserContext';

const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('UserContext is null. Make sure it is provided correctly.');
  }
  return context;
};

export default useUserContext;
