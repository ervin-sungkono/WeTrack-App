import moment from "moment"
import 'moment/locale/id'

export const dateFormat = (date, includeTime = false) => {
    const formatString = includeTime ? "DD MMM YYYY hh:mm A" : "DD MMM YYYY"
    if(date === null || date === undefined){
        return null
    }else{
        if(typeof date === "string"){ //ISO String
            return moment(date).format(formatString)
        }else if(typeof date === "integer"){ //Timestamp
            return moment.unix(date).format(formatString)
        }
    }
}

export const listDateFormat = (date) => {
    const currentDate = new Date()
    const dateDifference = currentDate.getDate() - date.getDate()
    let formatString = ""
    switch(dateDifference){
        case 0:
            formatString = "[Hari ini], HH:mm"
            break
        case 1:
            formatString = "[Kemarin], HH:mm"
            break
        default:
            formatString = "DD MMM YYYY, HH:mm"
            break
    }
    return moment(date).format(formatString)
}