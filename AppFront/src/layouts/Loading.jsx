import { CircularProgress } from 'react-loader-spinner';

export const Loading = () => {
    return (
        <>
            <div className="success-modal">
                <div>
                    <CircularProgress
                        height="100"
                        width="100"
                        color="#ffffff"
                        ariaLabel="circular-progress-loading"
                        wrapperStyle={{}}
                        wrapperClass="wrapper-class"
                        visible={true}
                        strokeWidth={3}
                        animationDuration={1}
                    />
                    <p className='m-0 mt-2 fw-bold fs-4 text-white'>
                        Cargando
                    </p>
                </div>
            </div>
        </>
    )
}

export default Loading;
