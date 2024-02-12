import Button from "./button/Button";
import Footer from "./footer/Footer";
import Image from "next/image";

function CustomLine({size='md'}){
    const getSize = () => {
        switch(size){
            case 'sm':
                return `w-8 md:w-12 xl:w-16`
            case 'md':
                return `w-12 md:w-16 xl:w-20`
            case 'lg':
                return `w-16 md:w-20 xl:w-24`
            default:
                return `w-12 md:w-16 xl:w-20`
        }
    }
    const getSecondSize = () => {
        switch(size){
            case 'sm':
                return `w-1 md:w-2 xl:w-3`
            case 'md':
                return `w-2 md:w-3 xl:w-4`
            case 'lg':
                return `w-3 md:w-4 xl:w-5`
            default:
                return `w-2 md:w-3 xl:w-4`
        }
    }
    const getHeight = () => {
        switch(size){
            case 'sm':
                return `4px`
            case 'md':
                return `6px`
            case 'lg':
                return `8px`
            default:
                return `6px`
        }
    }
    return(
        <>
            <div className={`rounded-full bg-basic-blue ${getSize()}`} style={{height: getHeight()}}></div>
            <div className={`ml-1 rounded-full bg-basic-blue ${getSecondSize()}`} style={{height: getHeight()}}></div>
        </>
    )
}

function FeatureCard({image, title, description}){
    return(
        <div className="flex flex-col justify-center items-center text-center bg-white shadow-lg p-4">
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
    return (
        <div className="pt-2 xl:pt-8">
            <div className="py-4 md:py-6 xl:py-8 px-8 md:px-16 xl:px-32 flex flex-col xl:flex-row items-center justify-center xl:justify-between">
                <div>
                    <h1 className="text-xl md:text-5xl font-bold leading-tight">
                        Solve issues efficiently, <br />
                        collaborate with powerful <br />
                        AI tools.
                    </h1>
                    <p className="mt-2 text-sm md:text-lg">
                        WeTrack offers you the best solution in project management and issue tracking.
                    </p>
                    <Button variant="primary" size={`md`} className="mt-2 xl:mt-8 px-2 xl:px-8">
                        Start Now
                    </Button>
                </div>
                <div>
                    <Image src={'/WelcomePicture.png'} alt="WeTrack" width={600} height={600}/>
                </div>
            </div>
            <div className="bg-light-blue py-4 md:py-6 xl:py-8 px-8 md:px-16 xl:px-32">
                <h1 className="text-lg md:text-2xl font-bold">About WeTrack</h1>
                <div className="mt-1 md:mt-2 flex">
                    <CustomLine size="md"/>
                </div>
                <p className="text-sm md:text-md mt-2 md:mt-4 w-full md:w-4/5 opacity-80">
                WeTrack is an innovative collaborative project management platform that empowers developers to streamline project development processes with efficiency and precision, boasting seamless integration with cutting-edge artificial intelligence capabilities to assist in task creation and issue resolution, thereby enhancing productivity and driving project success.
                </p>
            </div>
            <div className="py-4 md:py-6 xl:py-8 px-8 md:px-16 xl:px-32">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-2xl font-bold text-center">
                        Features
                    </h1>
                    <div className="mt-1 md:mt-2 flex w-full items-center justify-center">
                    <CustomLine size="md" />
                    </div> 
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 md:gap-4 xl:gap-6 mt-4 xl:mt-8 w-4/5 md:w-3/5 lg:w-1/2 xl:w-4/5">
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