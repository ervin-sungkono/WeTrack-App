"use client"

import Button from "./button/Button";
import Footer from "./footer/Footer";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

function CustomLine({height=10, width1=6, width2=2}){
    return(
        <>
            <div className="rounded-full bg-basic-blue" style={{height: `${height}px`, width:`${width1}%`}}></div>
            <div className="ml-1 rounded-full bg-basic-blue" style={{height: `${height}px`, width:`${width2}%`}}></div>
        </>
    )
}

function FeatureCard({image, title, description}){
    return(
        <div className="flex flex-col justify-center items-center text-center bg-white shadow-lg p-6">
            <Image src={image} alt={title} width={200} height={200}/>
            <h1 className="text-md md:text-lg font-bold mt-2 md:mt-4">
                {title}
            </h1>
            <p className="text-xs md:text-sm mt-4 md:mt-8">
                {description}
            </p>
        </div>
    )
}

export default function HomeLayout(){
    const isSmallScreen = useMediaQuery({maxWidth: 440})

    return (
        <div className="pt-2 md:pt-8">
            <div className="py-4 md:py-8 px-8 md:px-32 flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-5xl font-bold leading-tight">
                        Solve issues efficiently, <br />
                        collaborate with powerful <br />
                        AI tools.
                    </h1>
                    <p className="mt-2 text-sm md:text-lg">
                        WeTrack offers you the best solution in project management and issue tracking.
                    </p>
                    <Button variant="primary" size={isSmallScreen ? `sm` : `md`} className="mt-2 md:mt-8 px-2 md:px-8">
                        Start Now
                    </Button>
                </div>
                <div>
                    <Image src={'/WelcomePicture.png'} alt="WeTrack" width={600} height={600}/>
                </div>
            </div>
            <div className="bg-light-blue py-4 md:py-8 px-8 md:px-32">
                <h1 className="text-lg md:text-2xl font-bold">About WeTrack</h1>
                <div className="mt-1 md:mt-2 flex">
                    <CustomLine height={6} width1={isSmallScreen ? `18` : `6`} width2={isSmallScreen ? `6` : `2`}/>
                </div>
                <p className="text-sm md:text-md mt-2 md:mt-4 w-full md:w-3/4 opacity-80">
                WeTrack is an innovative collaborative project management platform that empowers developers to streamline project development processes with efficiency and precision, boasting seamless integration with cutting-edge artificial intelligence capabilities to assist in task creation and issue resolution, thereby enhancing productivity and driving project success.
                </p>
            </div>
            <div className="py-2 md:py-8 px-8 md:px-32">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-2xl font-bold text-center">
                        Features
                    </h1>
                    <div className="mt-1 md:mt-2 flex w-full items-center justify-center">
                    <CustomLine height={6} width1={isSmallScreen ? `18` : `6`} width2={isSmallScreen ? `6` : `2`}/>
                    </div> 
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-4 md:mt-8 md:w-4/5">
                        <FeatureCard 
                            image={'/AIPoweredAssistance.png'}
                            title="AI-Powered Assistance"
                            description="WeTrack uses the power of artificial intelligence to assist users in creating tasks efficiently, leveraging intelligent algorithms to streamline task management processes and boost productivity."
                        />
                        <FeatureCard
                            image={'/TimelineManagement.png'}
                            title="Timeline Management"
                            description="WeTrack enables users to effortlessly manage project deadlines, offering a visual representation of project progress and key milestones, thus facilitating better planning and coordination among team members."
                        />
                        <FeatureCard
                            image={'/CollaborativeProjectManagement.png'}
                            title="Collaborative Project Management"
                            description="WeTrack offers collaboration among team members by providing a centralized platform for project management, allowing users to collaborate in real-time, share updates, and address issues promptly."
                        />
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}