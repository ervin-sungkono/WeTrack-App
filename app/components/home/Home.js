import Button from "../common/button/Button";
import Footer from "../common/footer/Footer";
import Image from "next/image";

function CustomLine({size='md'}){
    const getSize = () => {
        switch(size){
            case 'sm':
                return `w-8 md:w-12 lg:w-16`
            case 'md':
                return `w-12 md:w-16 lg:w-20`
            case 'lg':
                return `w-16 md:w-20 lg:w-24`
            default:
                return `w-12 md:w-16 lg:w-20`
        }
    }
    const getSecondSize = () => {
        switch(size){
            case 'sm':
                return `w-1 md:w-2 lg:w-3`
            case 'md':
                return `w-2 md:w-3 lg:w-4`
            case 'lg':
                return `w-3 md:w-4 lg:w-5`
            default:
                return `w-2 md:w-3 lg:w-4`
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
        <div className="rounded-xl flex flex-col justify-center items-center text-center bg-white shadow-lg p-4">
            <Image src={image} alt={title} width={200} height={200} quality={100}/>
            <h1 className="text-md md:text-lg xl:text-xl font-bold mt-2 md:mt-4">
                {title}
            </h1>
            <p className="text-xs md:text-sm mt-2 md:mt-4 xl:mt-6">
                {description}
            </p>
        </div>
    )
}

export default function HomeLayout(){
    return (
        <div className="pt-2 xl:pt-8">
            <div className="py-4 md:py-6 xl:py-8 container flex flex-col lg:flex-row items-center justify-center lg:justify-between text-center lg:text-left">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl lg:leading-tight font-bold">
                        Selesaikan tugas secara efisien, <br />
                        berkolaborasi dengan peralatan AI yang canggih.
                    </h1>
                    <p className="mt-1 lg:mt-2 text-sm lg:text-md">
                        WeTrack menawarkan solusi terbaik dalam manajemen proyek dan pelacakan tugas.
                    </p>
                    <Button variant="primary" size={`md`} className="mt-2 lg:mt-6 xl:mt-8 px-2 xl:px-8">
                        Mulai Sekarang
                    </Button>
                </div>
                <div>
                    <Image src={'/WelcomePicture.png'} alt="WeTrack" width={600} height={600} priority/>
                </div>
            </div>
            <div className="bg-light-blue py-4 md:py-6 lg:py-8 container text-center lg:text-left">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Tentang WeTrack</h1>
                <div className="mt-1 md:mt-2 flex items-center lg:items-start justify-center lg:justify-start">
                    <CustomLine size="md"/>
                </div>
                <p className="text-sm md:text-md mt-2 md:mt-4 w-full lg:w-5/6 opacity-80">
                WeTrack adalah sebuah platform manajemen proyek kolaboratif inovatif yang membantu developer mempercepat proses pengembangan proyek dengan efisiensi dan presisi, dengan integrasi yang mulus dengan kemampuan kecerdasan buatan terkini untuk membantu dalam pembuatan tugas dan penyelesaian tugas, sehingga meningkatkan produktivitas dan mendorong kesuksesan proyek.
                </p>
            </div>
            <div className="py-4 md:py-6 lg:py-8 pb-10 md:pb-10 lg:pb-12 container">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-center">
                        Fitur
                    </h1>
                    <div className="mt-1 md:mt-2 flex w-full items-center justify-center">
                    <CustomLine size="md" />
                    </div> 
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8 mt-4 lg:mt-8 w-full md:w-3/5 xl:w-5/6 lg:w-full">
                        <FeatureCard 
                            image={'/AIPoweredAssistance.png'}
                            title="Bantuan AI"
                            description="WeTrack menggunakan bantuan kecerdasan buatan untuk membantu pengguna dalam membuat tugas dengan efisien, memanfaatkan algoritma cerdas untuk mempercepat proses manajemen tugas dan meningkatkan produktivitas."
                        />
                        <FeatureCard
                            image={'/TimelineManagement.png'}
                            title="Manajemen Linimasa"
                            description="WeTrack memungkinkan pengguna untuk mengelola tenggat waktu proyek dengan mudah, menawarkan representasi visual dari kemajuan proyek dan tonggak kunci, sehingga memfasilitasi perencanaan dan koordinasi yang lebih baik di antara anggota tim."
                        />
                        <FeatureCard
                            image={'/CollaborativeProjectManagement.png'}
                            title="Manajemen Proyek Kolaboratif"
                            description="WeTrack menawarkan kolaborasi di antara anggota tim dengan menyediakan platform terpusat untuk manajemen proyek, memungkinkan pengguna untuk berkolaborasi  dalam waktu nyata, membagikan pembaruan, dan menangani masalah dengan cepat."
                        />
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}