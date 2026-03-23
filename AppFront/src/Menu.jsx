import { useState, useEffect } from 'react';
import { HostLocation } from './utils/HostLocation';
import { getConfig } from './services/config.service.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Loading from './layouts/Loading.jsx';

export const Menu = ({ userLog, setUserLog }) => {

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);

    const recuperarConfig = async () => {
        setLoading(true);

        try {
            const response = await getConfig();

            const BACKEND_URL = HostLocation(1);
            if (response.items[0].imagenurl) setLogo(BACKEND_URL + "/biotech" + response.items[0].imagenurl);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        recuperarConfig();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}

            <div className="position-fixed top-0 start-0 w-100 vh-100">
                <Header userLog={userLog} title={'INICIO'} onToggleSidebar={toggleSidebar} on={1} icon={'list-task'} />
                <Sidebar
                    userLog={userLog}
                    setUserLog={setUserLog}
                    isSidebarVisible={isSidebarVisible}
                />
                <div className='logoMenu'>
                    <a href='https://biosafrasgroup.com.py/' target='_blank'>
                        {logo && (
                            <img src={logo} alt="Logo Empresa" />
                        )}
                    </a>
                </div>
            </div>
        </>
    )
}

export default Menu;
