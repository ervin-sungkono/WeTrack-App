import nodemailer from "nodemailer"

const sender_email = process.env.EMAIL
const pass = process.env.EMAIL_PASS
const WEB_URL = process.env.NEXTAUTH_URL

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: sender_email,
        pass,
    },
})

const generateEmailContent = ({ sender_name, invitation_link, project_name }) => {
    return {
        text: `[UNDANGAN WETRACK] Diundang oleh: ${sender_name}, Nama Projek: ${project_name}`,
        html: `<!DOCTYPE html><html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><style type="text/css">a,body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table{border-collapse:collapse!important}body{height:100%!important;margin:0!important;padding:0!important;width:100%!important}@media screen and (max-width:525px){.wrapper{width:100%!important;max-width:100%!important}.responsive-table{width:100%!important}.padding{padding:10px 5% 15px 5%!important}.section-padding{padding:0 15px 50px 15px!important}}.form-container{margin-bottom:24px;padding:20px;border:1px solid #cfcfcf;border-radius:6px}.invite-btn{padding:12px 24px;background-color:rgba(71,56,159,1);color:#fff !important;font-weight: 600;border-radius:4px;text-decoration:none;transition:.3s background-color ease-in-out}.invite-btn:hover{background-color:rgba(71,56,159,.8)}div[style*="margin: 16px 0;"]{margin:0!important}</style></head><body style="margin:0!important;padding:0!important;background:#fff"><div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden"></div><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td bgcolor="#ffffff" align="center" style="padding:10px 15px 30px 15px" class="section-padding"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px" class="responsive-table"><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0;font-size:16px;line-height:25px;color:#232323;text-align:center" class="padding message-content"><h2 style="text-align:center">Undangan bergabung di WeTrack</h2><p style="font-size:12px;text-align:center">Dikirim hari ${new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'})}</p><div class="form-container"><p style="margin-top:0em;margin-bottom:1.25em;">${sender_name} telah mengirim Anda undangan bergabung dengan timnya dalam proyek <b>[${project_name}]</b>, silakan klik tombol di bawah ini untuk bergabung!</p><a class="invite-btn" href="${invitation_link}">Bergabung</a></div><svg width="148" height="26" viewBox="0 0 148 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.1614 0.5L21.3045 8.54333H5.01819L13.1614 0.5Z" fill="#47389F"/><path d="M0 13.5L2.22625 11.301H24.0965L26.3227 13.5L14.6577 25.022V11.3011H11.8658L11.8658 25.2203L0 13.5Z" fill="#47389F"/><path d="M13.1295 26.4685L13.1614 26.5L13.1932 26.4685H13.1295Z" fill="#47389F"/><path d="M36.2201 22.8438L30.1922 4.64375H34.6144L39.8526 20.7638H37.6415L43.1166 4.64375H47.065L52.3296 20.7638H50.1974L55.5673 4.64375H59.6473L53.6194 22.8438H49.0392L44.3801 8.69975H45.5909L40.8002 22.8438H36.2201Z" fill="#47389F"/><path d="M67.7125 23.0518C66.098 23.0518 64.6766 22.7398 63.4482 22.1158C62.2374 21.4918 61.2985 20.6424 60.6317 19.5678C59.9649 18.4758 59.6314 17.2364 59.6314 15.8498C59.6314 14.4458 59.9561 13.2064 60.6054 12.1318C61.2722 11.0398 62.176 10.1904 63.3166 9.58375C64.4573 8.95975 65.7471 8.64775 67.1861 8.64775C68.5724 8.64775 69.8183 8.94242 70.9239 9.53175C72.047 10.1038 72.9332 10.9358 73.5825 12.0278C74.2318 13.1024 74.5564 14.3938 74.5564 15.9018C74.5564 16.0578 74.5476 16.2398 74.5301 16.4478C74.5126 16.6384 74.495 16.8204 74.4774 16.9938H62.9744V14.6278H72.319L70.7396 15.3298C70.7396 14.6018 70.5905 13.9691 70.2921 13.4318C69.9938 12.8944 69.5814 12.4784 69.055 12.1838C68.5285 11.8717 67.9143 11.7158 67.2124 11.7158C66.5104 11.7158 65.8875 11.8717 65.3435 12.1838C64.817 12.4784 64.4046 12.9031 64.1063 13.4578C63.808 13.9951 63.6588 14.6364 63.6588 15.3818V16.0058C63.6588 16.7684 63.8255 17.4444 64.159 18.0338C64.5099 18.6058 64.9925 19.0478 65.6067 19.3598C66.2384 19.6544 66.9755 19.8018 67.8178 19.8018C68.5724 19.8018 69.2305 19.6891 69.792 19.4638C70.3711 19.2384 70.8976 18.9004 71.3714 18.4498L73.5562 20.7898C72.9069 21.5178 72.0909 22.0811 71.1081 22.4798C70.1254 22.8611 68.9935 23.0518 67.7125 23.0518Z" fill="#47389F"/><path d="M78.9546 22.8438V8.07575H73.0583V4.64375H89.1151V8.07575H83.2189V22.8438H78.9546Z" fill="#47389F"/><path d="M90.8115 22.8438V8.85575H94.7336V12.8078L94.1808 11.6638C94.602 10.6758 95.2776 9.93042 96.2077 9.42775C97.1377 8.90775 98.2696 8.64775 99.6033 8.64775V12.3918C99.4278 12.3744 99.2699 12.3658 99.1295 12.3658C98.9891 12.3484 98.84 12.3398 98.682 12.3398C97.5589 12.3398 96.6464 12.6604 95.9445 13.3018C95.2601 13.9258 94.9179 14.9051 94.9179 16.2398V22.8438H90.8115Z" fill="#47389F"/><path d="M109.806 22.8438V20.1138L109.543 19.5158V14.6278C109.543 13.7611 109.271 13.0851 108.727 12.5998C108.2 12.1144 107.384 11.8718 106.279 11.8718C105.524 11.8718 104.778 11.9931 104.041 12.2358C103.322 12.4611 102.708 12.7731 102.199 13.1718L100.725 10.3378C101.497 9.80042 102.427 9.38442 103.515 9.08975C104.603 8.79508 105.708 8.64775 106.832 8.64775C108.99 8.64775 110.666 9.15042 111.859 10.1558C113.053 11.1611 113.649 12.7297 113.649 14.8617V22.8438H109.806ZM105.489 23.0518C104.384 23.0518 103.436 22.8698 102.646 22.5058C101.857 22.1244 101.251 21.6131 100.83 20.9718C100.409 20.3304 100.198 19.6111 100.198 18.8138C100.198 17.9818 100.4 17.2538 100.804 16.6298C101.225 16.0058 101.883 15.5204 102.778 15.1738C103.673 14.8098 104.84 14.6278 106.279 14.6278H110.043V16.9938H106.726C105.761 16.9938 105.094 17.1498 104.726 17.4618C104.375 17.7738 104.199 18.1638 104.199 18.6318C104.199 19.1518 104.401 19.5678 104.805 19.8798C105.226 20.1744 105.796 20.3218 106.516 20.3218C107.2 20.3218 107.814 20.1658 108.358 19.8538C108.902 19.5244 109.297 19.0478 109.543 18.4238L110.175 20.2958C109.876 21.1971 109.332 21.8818 108.543 22.3498C107.753 22.8178 106.735 23.0518 105.489 23.0518Z" fill="#47389F"/><path d="M124.312 23.0518C122.786 23.0518 121.426 22.7484 120.232 22.1418C119.039 21.5178 118.1 20.6598 117.416 19.5678C116.749 18.4758 116.416 17.2364 116.416 15.8498C116.416 14.4458 116.749 13.2064 117.416 12.1318C118.1 11.0398 119.039 10.1904 120.232 9.58375C121.426 8.95975 122.786 8.64775 124.312 8.64775C125.804 8.64775 127.103 8.95975 128.208 9.58375C129.314 10.1904 130.13 11.0658 130.656 12.2098L127.471 13.8998C127.103 13.2411 126.637 12.7558 126.076 12.4438C125.532 12.1318 124.935 11.9758 124.286 11.9758C123.584 11.9758 122.952 12.1318 122.391 12.4438C121.829 12.7558 121.382 13.1978 121.048 13.7698C120.732 14.3418 120.574 15.0351 120.574 15.8498C120.574 16.6644 120.732 17.3578 121.048 17.9298C121.382 18.5018 121.829 18.9438 122.391 19.2558C122.952 19.5678 123.584 19.7238 124.286 19.7238C124.935 19.7238 125.532 19.5764 126.076 19.2818C126.637 18.9698 127.103 18.4758 127.471 17.7998L130.656 19.5158C130.13 20.6424 129.314 21.5178 128.208 22.1418C127.103 22.7484 125.804 23.0518 124.312 23.0518Z" fill="#47389F"/><path d="M136.339 19.9838L136.444 15.0438L143.051 8.85575H147.947L141.603 15.2258L139.471 16.9418L136.339 19.9838ZM132.943 22.8438V3.55175H137.05V22.8438H132.943ZM143.499 22.8438L138.708 16.9678L141.288 13.8218L148.474 22.8438H143.499Z" fill="#47389F"/></svg><p style="margin-top:.25em;font-size:12px">©2024 WeTrack, All Rights Reserved</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`,
    }
}

export const sendMail = async({ email, fullName, projectId, projectName }) => {
    const receiver_email = email

    try{
        await transporter.sendMail({
            from: sender_email,
            to: receiver_email,
            ...generateEmailContent({
                sender_name: fullName,
                invitation_link: `${WEB_URL}/invite/${projectId}?senderName=${fullName}&projectName=${projectName}`,
                project_name: projectName
            }),
            subject: `Undangan dari ${fullName} untuk bergabung di WeTrack`
        })
    }catch(err){
        console.log("Fail to send mail", err.message)
    }
}