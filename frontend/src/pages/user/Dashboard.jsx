import Sidebar from '../../components/Sidebar'
import { Outlet } from 'react-router-dom';


const Dashboard = () => {
    return (
        <div style={{ display: "flex" }}>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>

        </div>
    );
};

export default Dashboard;