import moment from "moment"

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