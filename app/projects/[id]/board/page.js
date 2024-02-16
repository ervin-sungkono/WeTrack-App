// Board Page
import SideLayout from "@/app/components/layout/SideLayout"

export default function BoardPage({ params: { id } }){
    console.log(id)
    return(
        <SideLayout>
            Board
        </SideLayout>
    )
}