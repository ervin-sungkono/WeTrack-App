import { TailSpin } from "react-loader-spinner"
import PopUp from "./PopUp"

export default function PopUpLoad() {
    return (
        <PopUp>
            <TailSpin 
                color="#47389F"
                height={100}
                width={100}
            />
        </PopUp>
    )
}