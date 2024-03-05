import { TailSpin } from "react-loader-spinner"

export default function PopUpLoad() {
    return (
        <div style={
            {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 10000,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
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