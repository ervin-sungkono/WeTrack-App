// Board Page
import SideLayout from "@/app/components/common/layout/SideLayout"

export default function BoardPage({ params: { id } }){
    console.log(id)
    return(
        <SideLayout>
            Board
        </SideLayout>
    )
}