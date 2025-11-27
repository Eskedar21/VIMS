import './App.css';
import AppRouter from './app/router.jsx';
import AppShell from './components/AppShell/index.jsx';

const App = () => (
  <AppShell>
    <AppRouter />
  </AppShell>
);

export default App;