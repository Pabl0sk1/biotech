import { useState, useEffect } from 'react';
import { HostLocation } from './utils/HostLocation';
import { getConfig } from './services/config.service.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export const Menu = ({ userLog, setUserLog }) => {

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [logo, setLogo] = useState(null);

    const recuperarConfig = async () => {
        const response = await getConfig();

        const BACKEND_URL = HostLocation(1);
        if (response.items[0].imagenurl) setLogo(BACKEND_URL + "/biotech" + response.items[0].imagenurl);
    }

    useEffect(() => {
        recuperarConfig();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <>
            <div className="position-fixed top-0 start-0 w-100 vh-100">
                <Header userLog={userLog} title={'INICIO'} onToggleSidebar={toggleSidebar} on={1} icon={'list-task'} />
                <Sidebar
                    userLog={userLog}
                    setUserLog={setUserLog}
                    isSidebarVisible={isSidebarVisible}
                />
                <div className='logoMenu'>
                    <a href='https://biosafrasgroup.com.py/' target='_blank'>
                        <img src={logo} alt="Logo Empresa" />
                    </a>
                </div>
            </div>
        </>
    )
}

export default Menu;