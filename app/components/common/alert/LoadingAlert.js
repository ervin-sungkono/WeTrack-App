export default function LoadingAlert() {
    return (
        <div style={
            {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 999,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
            }
        }>
            <div className="bg-basic-blue text-white p-6 rounded text-center" style={
                {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }
            }>
                <h1 className="text-md md:text-lg xl:text-xl">Loading...</h1>
            </div>
        </div>
    )
}