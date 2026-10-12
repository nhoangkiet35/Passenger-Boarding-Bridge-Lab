import { createRoot } from 'react-dom/client';
import Explore from './explore/Explore';
import '../app/globals.css';
import './admin.css';
createRoot(document.getElementById('root')!).render(<Explore/>);
