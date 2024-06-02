import UserIcon from "@/app/components/common/UserIcon"
import Label from "@/app/components/common/Label"
import { listDateFormat } from "@/app/lib/date"
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history"

import { GoArrowRight as ArrowIcon } from "react-icons/go";

export default function TaskHistoryItem({history}){

    const renderHistoryUpdate = () => {
        if(history.eventType === getHistoryEventType.assignedTo){
            return(
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-dark-blue">
                    <div className="flex gap-1 items-center">
                        <div>
                            <UserIcon 
                                size="xs" 
                                fullName={history.previousValue?.fullName} 
                                src={history.previousValue ? history.previousValue.profileImage?.attachmentStoragePath : '/images/user-placeholder.png'}
                            />
                        </div>
                        <p className="font-semibold text-dark-blue/80">{history.previousValue?.fullName ?? "Belum Ditugaskan"}</p>
                    </div> 
                    <ArrowIcon size={16} className="flex-shrink-0"/>
                    <div className="flex gap-1 items-center">
                        <div>
                            <UserIcon 
                                size="xs" 
                                fullName={history.newValue?.fullName} 
                                src={history.newValue ? history.newValue.profileImage?.attachmentStoragePath : '/images/user-placeholder.png'}
                            />
                        </div>
                        <p className="font-semibold text-dark-blue/80">{history.newValue?.fullName ?? "Belum Ditugaskan"}</p>
                    </div> 
                </div>
            )
        }else if(history.eventType === getHistoryEventType.taskName || history.eventType === getHistoryEventType.taskStatus){
            return(
                <div className="flex gap-1.5 items-center text-xs md:text-sm text-dark-blue">
                    <Label color="#47389F" text={history.previousValue}/>
                    <ArrowIcon size={16} className="flex-shrink-0"/>
                    <Label color="#47389F" text={history.newValue}/>
                </div>
            )
        }
    }
    
    return(
        <div key={history.id} className="flex items-start gap-2 md:gap-3">
            <div><UserIcon size="sm" fullName={history.user?.fullName} src={ history.user ? history.user.profileImage?.attachmentStoragePath : "/images/user-placeholder.png"}/></div>
            <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex gap-2 items-center">
                    <p className="text-xs md:text-sm text-dark-blue">
                        <span className="font-semibold">{history.user?.fullName ?? "Sistem"}</span> {history.action} <span className="font-semibold">{history.eventType}</span>
                    </p>
                    <p className="text-[11.2px] md:text-sm text-dark-blue/80">{listDateFormat(history.createdAt)}</p>
                </div>
                {history.action === getHistoryAction.update && renderHistoryUpdate()}
            </div>
        </div>
    )
}