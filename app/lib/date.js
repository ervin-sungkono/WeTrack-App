import moment from "moment"
import "moment/locale/id"
moment.locale("id")

export const dateFormat = (date, includeTime = false) => {
    const formatString = includeTime ? "D MMMM YYYY hh:mm" : "D MMMM YYYY"
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
    let formatString = ""

    const getDateType = (date) => {
        if (typeof date === "string") {
            return moment(date);
        } else if (typeof date === "object" && date.seconds) {
            return moment.unix(date.seconds);
        } else {
            return null;
        }
    };

    const momentDate = getDateType(date);
    if (!momentDate || !momentDate.isValid()) {
        return "Invalid date";
    }

    const startOfToday = currentDate.clone().startOf('day');
    const startOfYesterday = startOfToday.clone().subtract(1, 'days');

    if (momentDate.isSameOrAfter(startOfToday)) {
        formatString = "[Hari ini], HH:mm";
    } else if (momentDate.isSameOrAfter(startOfYesterday) && momentDate.isBefore(startOfToday)) {
        formatString = "[Kemarin], HH:mm";
    } else {
        formatString = "D MMM YYYY, HH:mm";
    }

    return momentDate.format(formatString);
}