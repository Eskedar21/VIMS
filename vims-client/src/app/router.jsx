import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import InspectionPage from '../pages/InspectionPage.jsx';
import MachineTestPage from '../features/inspection/machineTest/MachineTestPage.jsx';
import ResultPage from '../pages/ResultPage.jsx';
import MachineStatusPage from '../pages/MachineStatusPage.jsx';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/machine-test" element={<MachineTestPage />} />
    <Route path="/inspection" element={<InspectionPage />} />
    <Route path="/result" element={<ResultPage />} />
    <Route path="/machine-status" element={<MachineStatusPage />} />
  </Routes>
);

export default AppRouter;
