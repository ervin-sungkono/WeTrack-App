import moment from "moment"

export const dateFormat = (date) => {
    if(date === null || date === undefined){
        return null
    }else{
        if(typeof date === "string"){ //ISO String
            return moment(date).format("DD MMM YYYY")
        }else if(typeof date === "integer"){ //Timestamp
            return moment.unix(date).format("DD MMM YYYY")
        }
    }
}