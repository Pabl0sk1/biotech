import Header from "./Header";

export const Dashboard = ({ userLog }) => {

    return (
        <>
            <Header userLog={userLog} title={'DASHBOARD'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            {userLog?.vermapa && userLog?.sucursal?.id == 13 && (
                <iframe title="Informe_Mapa_000" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=0e941ed0-c4cb-41ee-bb1b-2c6ab4286769&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 1 && (
                <iframe title="Informe_Mapa_001" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=61ce142f-dfd3-4ed5-b42f-2ca58f3f0224&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 2 && (
                <iframe title="Informe_Mapa_002" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=395698d4-ec84-4b21-b25f-16c4179378eb&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 3 && (
                <iframe title="Informe_Mapa_003" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=ec3842bc-417d-4f75-9e0b-de6ad38af47d&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 4 && (
                <iframe title="Informe_Mapa_004" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=23b78457-c37d-42d2-97f8-1f2af0bbd5a3&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 5 && (
                <iframe title="Informe_Mapa_005" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=2f8886e2-87da-4d26-ba3e-a6cd6e028817&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 6 && (
                <iframe title="Informe_Mapa_006" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=40fe07f0-da0f-42eb-8120-91812b45e51e&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 7 && (
                <iframe title="Informe_Mapa_007" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=f5fdbded-fb12-4796-879e-13b1e0e05b8b&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 8 && (
                <iframe title="Informe_Mapa_008" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=65723b51-2a23-4eb2-bf62-b709854d810f&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 9 && (
                <iframe title="Informe_Mapa_009" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=baffa751-a68a-4276-ae74-8dda5f6da685&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 10 && (
                <iframe title="Informe_Mapa_010" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=c25975a2-9377-468c-9157-e5b06b644ebb&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 11 && (
                <iframe title="Informe_Mapa_011" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=c7d9d9bd-92b5-41ac-91b6-748e27172fe7&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
            {userLog?.vermapa && userLog?.sucursal?.id == 12 && (
                <iframe title="Informe_Mapa_012" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=fc2e9f68-a885-4597-b2ec-9f29a01fca7f&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
            )}
        </>
    )
}

export default Dashboard;
