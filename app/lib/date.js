import moment from "moment"

export const dateFormat = (date) => {
    if(date === null || date === undefined){
        return null
    }else{
        return moment(date).format("DD MMM YYYY")
    }
}