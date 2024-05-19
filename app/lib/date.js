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
    let dateDifference = 0
    let formatString = ""
    if(typeof date === "string" || typeof date === "object"){ //ISO String
        dateDifference = currentDate.diff(moment(date), 'days')
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
    }else if(typeof date === "number"){ //Timestamp
        const comparedDate = moment(new Date(date*1000))
        dateDifference = currentDate.dayOfYear() - comparedDate.dayOfYear()
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
        return moment.unix(date).format(formatString)
    }
}