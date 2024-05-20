import UserIcon from "@/app/components/common/UserIcon"
import Label from "@/app/components/common/Label"
import { listDateFormat } from "@/app/lib/date"
import { getHistoryAction } from "@/app/lib/history"

export default function TaskHistoryItem({history}){
    
    return(
        <div key={history.id} className="flex items-center gap-2 md:gap-3">
            <UserIcon size="sm" fullName={history.user.fullName} src={history.user.profileImage}/>
            <div className="flex flex-col gap-1.5">
                <div className="flex gap-2 items-center">
                    <p className="text-xs md:text-sm text-dark-blue">
                        <span className="font-semibold">{history.user.fullName}</span> {history.action} <span className="font-semibold">{history.eventType}</span>
                    </p>
                    <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(history.createdAt)}</p>
                </div>
                {history.action === getHistoryAction.update && 
                <div className="flex gap-2 text-sm text-dark-blue">
                    <Label color="#47389F" text={history.previousValue}/> {"-->"} <Label color="#47389F" text={history.newValue}/>
                </div>}
            </div>
        </div>
    )
}