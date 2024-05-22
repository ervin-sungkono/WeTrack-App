import TaskHistoryItem from "./history/TaskHistoryItem"
import EmptyState from "../../common/EmptyState"

export default function HistorySection({ histories }){
    if(!histories){
        return(
            <div>Memuat data riwayat..</div>
        )
    }
    return(
        <div className="flex flex-col gap-2 md:gap-3">
            {histories && histories.length > 0 ? 
            histories.map(history => (
                <TaskHistoryItem key={history.id} history={history}/>
            )) :
            <EmptyState message="Belum ada riwayat dalam tugas ini."/>}
        </div>
    )
}