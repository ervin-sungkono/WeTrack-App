import WeTrackLogo from "../Logo"
import { MdEmail } from "react-icons/md"

export default function Footer(){
    return (
        <div className="flex flex-col justify-center text-center text-white text-sm items-center p-8 bg-dark-blue">
            <WeTrackLogo color="#FFFFFF"/>
            <div className="flex items-center mt-4">
                <MdEmail className="text-white text-xl mr-2"/>
                wetrack.info@gmail.com
            </div>
            <p className="mt-4">
                &copy; 2024 WeTrack, All Rights Reserved
            </p>
        </div>
    )
}