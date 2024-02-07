import Button from "./button/Button";
import Footer from "./footer/Footer";
import Image from "next/image";

function FeatureCard({image, title, description}){
    return(
        <div className="flex flex-col justify-center items-center text-center bg-white shadow-lg p-6">
            <Image src={image} alt={title} width={200} height={200}/>
            <h1 className="text-lg font-bold mt-4">
                {title}
            </h1>
            <p className="text-sm mt-8">
                {description}
            </p>
        </div>
    )
}

export default function HomeLayout(){
    return (
        <div className="pt-8">
            <div className="py-8 px-32 flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-bold leading-tight">
                        Solve issues efficiently, <br />
                        collaborate with powerful <br />
                        AI tools.
                    </h1>
                    <p className="mt-2">
                        WeTrack offers you the best solution in project management and issue tracking.
                    </p>
                    <Button variant="primary" size="md" className="mt-8 px-8">
                        Start Now
                    </Button>
                </div>
                <div>
                    <Image src={'/WelcomePicture.png'} alt="WeTrack" width={600} height={600}/>
                </div>
            </div>
            <div className="bg-light-blue py-8 px-32">
                <h1 className="text-2xl font-bold">About WeTrack</h1>
                <div className="mt-2 flex">
                    <hr className="rounded-full" style={{backgroundColor: '#47389F', height: '10px', width:'6%'}}></hr>
                    <hr className="ml-1 rounded-full" style={{backgroundColor: '#47389F', height: '10px', width:'2%'}}></hr>
                </div>
                <p className="mt-4" style={{width: '75%'}}>
                WeTrack is an innovative collaborative project management platform that empowers developers to streamline project development processes with efficiency and precision, boasting seamless integration with cutting-edge artificial intelligence capabilities to assist in task creation and issue resolution, thereby enhancing productivity and driving project success.
                </p>
            </div>
            <div className="py-8 px-32">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl font-bold text-center">
                        Features
                    </h1>
                    <div className="mt-2 flex w-full items-center justify-center">
                        <hr className="rounded-full" style={{backgroundColor: '#47389F', height: '8px', width:'6%'}}></hr>
                        <hr className="ml-1 rounded-full" style={{backgroundColor: '#47389F', height: '8px', width:'2%'}}></hr>
                    </div>
                    <div className="flex justify-between items-baseline gap-6 mt-8" style={{width: '80%'}}>
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