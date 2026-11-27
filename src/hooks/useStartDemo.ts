import { useNavigate } from 'react-router-dom';
import { startDemoPersona } from '../services/auth';

/** Starts the demo persona (Maria) with one click and opens her job feed. */
export function useStartDemo() {
  const navigate = useNavigate();
  return () => {
    startDemoPersona();
    navigate('/jobs', {
      replace: true,
      state: { notice: 'You are using the demo persona Maria, a fictional wheelchair user. Everything here is sample data.' },
    });
  };
}
