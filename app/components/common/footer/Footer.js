import WeTrackLogo from "../Logo"
import { MdEmail } from "react-icons/md"
import { FaMapMarkerAlt } from "react-icons/fa"

export default function Footer(){
    return (
        <div className="flex flex-col justify-center text-center text-white text-sm  items-center p-8 bg-dark-blue">
            <WeTrackLogo color="#FFFFFF"/>
            <div className="flex items-center mt-8">
                <MdEmail className="text-white text-xl mr-2"/>
                support@wetrack.com
            </div>
            <div className="flex items-center mt-4">
                <FaMapMarkerAlt className="text-white text-xl mr-2"/>
                Jl. Sabang 101 Bandung
            </div>
            <p className="mt-8">
                &copy; 2024 WeTrack, All Rights Reserved
            </p>
        </div>
    )
}