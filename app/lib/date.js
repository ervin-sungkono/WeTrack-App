import moment from "moment"

export const dateFormat = (date, includeTime = false) => {
    const formatString = includeTime ? "DD MMM YYYY hh:mm A" : "DD MMM YYYY"
    if(date === null || date === undefined){
        return null
    }else{
        if(typeof date === "string" || typeof date === "object"){ //ISO String
            return moment(date).format(formatString)
        }else if(typeof date === "number"){ //Timestamp
            return moment.unix(date).format(formatString)
        }
    }
}

export const listDateFormat = (date) => {
    const currentDate = moment(new Date())
    const dateDifference = currentDate.diff(moment(date), 'days')
    let formatString = ""
    switch(dateDifference){
        case 0:
            formatString = "[Hari ini], HH:mm A"
            break
        case 1:
            formatString = "[Kemarin], HH:mm A"
            break
        default:
            formatString = "DD MMM YYYY, HH:mm A"
            break
    }
    return moment(date).format(formatString)
}