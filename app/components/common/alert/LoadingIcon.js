import { TailSpin } from "react-loader-spinner"

export default function LoadingIcon() {
    return (
        <div style={
            {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 999,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
            }
        }>
            <div style={
                {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }
            }>
                <TailSpin 
                    color="#47389F"
                    height={100}
                    width={100}
                />
            </div>
        </div>
    )
}