import Image from "next/image"

export default function LoginPage(){
    return(
        <div className="p-24">
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold">
                    Sign In
                </h1>
                <p className="mt-2">
                    Welcome back, please sign in to continue.
                </p>
            </div>
            <div className="p-8 my-8 bg-white">
                <p>Form</p>
            </div>
            <div className="flex flex-col justify-center items-center">
                <Image src="/WeTrack_DarkBlue.png" width="200" height="40" />
                <p className="mt-4">
                    &copy; 2024 All Rights Reserved
                </p>
            </div>
        </div>
    )
}