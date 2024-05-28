// import { db } from "@/app/firebase/config";
// import { nextAuthOptions } from "@/app/lib/auth";
// import { getUserSession } from "@/app/lib/session";
// import { collection, getDocs } from "firebase/firestore";
// import { NextResponse } from 'next/server'

// export async function GET(request, response) {
//     try {
//         const session = await getUserSession(request, response, nextAuthOptions)
//         const userId = session.user.uid
//         if(!userId){
//             return NextResponse.json({
//                 data: null,
//                 message: "Unauthorized, user id not found"
//             }, { status: 400 })
//         }

//         const projectRoleColRef = collection(db, 'projectRoles')
//         const projectRoleDocsRef = await getDocs(projectRoleColRef)

//         if(projectRoleDocsRef.empty()) {
//             return NextResponse.json({
//                 message: "Can't get project role docs"
//             }, { status: 404 })
//         }

//         let projectRoles = [];

//         projectRoleDocsRef.forEach((doc) => {
//             projectRoles.push({
//                 id: doc.id,
//                 roleName: doc.data().roleName
//             })
//             return projectRoles
//         })

//         return NextResponse.json({
//             data: projectRoles, 
//             message: "Succesfully get all available project roles"
//         }, { status: 200 })

//     } catch (error) {
//         console.error("Cannot get project roles", error);
//         return NextResponse.json({
//             data: null,
//             message: error.message
//         }, { status: 500 });
//     }
// }