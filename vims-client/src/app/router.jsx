import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import InspectionPage from '../pages/InspectionPage.jsx';
import MachineTestPage from '../features/inspection/machineTest/MachineTestPage.jsx';
import ResultPage from '../pages/ResultPage.jsx';
import MachineStatusPage from '../pages/MachineStatusPage.jsx';
import ActiveInspectionsPage from '../pages/ActiveInspectionsPage.jsx';
import CompletedInspectionsPage from '../pages/CompletedInspectionsPage.jsx';
import VehicleHistoryPage from '../pages/VehicleHistoryPage.jsx';
import RetestsPage from '../pages/RetestsPage.jsx';
import HelpPage from '../pages/HelpPage.jsx';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/machine-test" element={<MachineTestPage />} />
    <Route path="/inspection" element={<InspectionPage />} />
    <Route path="/result" element={<ResultPage />} />
    <Route path="/machine-status" element={<MachineStatusPage />} />
    <Route path="/inspections/active" element={<ActiveInspectionsPage />} />
    <Route path="/inspections/completed" element={<CompletedInspectionsPage />} />
    <Route path="/inspections/vehicle-history" element={<VehicleHistoryPage />} />
    <Route path="/inspections/retests" element={<RetestsPage />} />
    <Route path="/help" element={<HelpPage />} />
  </Routes>
);

export default AppRouter;
