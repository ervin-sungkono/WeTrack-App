export default function PopUp({width, children}) {
    return (
        <div style={
            {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 999,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }
        }>
            <div style={
                {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: width,
                }
            }>
                {children}
            </div>
        </div>
    )
}