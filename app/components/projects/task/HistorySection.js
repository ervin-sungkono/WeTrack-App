import TaskHistoryItem from "./history/TaskHistoryItem"

export default function HistorySection({ histories }){
    if(!histories){
        return(
            <div>Memuat data riwayat..</div>
        )
    }
    return(
        <div className="flex flex-col gap-2 md:gap-3">
            {histories.map(history => (
                <TaskHistoryItem key={history.id} history={history}/>
            ))}
        </div>
    )
}