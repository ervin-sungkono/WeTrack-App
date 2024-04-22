import { auth, db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { deleteExistingFile, uploadSingleFile } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, runTransaction } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const loggedIn = session.user
        const userId = session.user.uid

        if(!loggedIn){
            return NextResponse.json({
                message: "Unauthorized, must login first"
            }, { status: 401 })
        }

        if(!userId){
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 })
        }

        const data = await getDoc(doc(db, 'users', userId))

        if(!data){
            return NextResponse.json({
                message: "Can't find user detail"
            }, { status: 404 })
        }

        const { fullName, email, jobPosition , location, profileImage } = data.data()

        return NextResponse.json({
            data: {
                uid: data.id,
                email: email,
                fullName: fullName,
                jobPotition: jobPosition ?? null,
                location: location ?? null,
                profileImage: profileImage,
            }, 
            message: "Successfully get user detail"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const formData = await request.formData() 
        const fullName = formData.get('fullName')
        const email = formData.get('email')
        const jobPosition = formData.get('jobPosition')
        const location = formData.get('location')
        const profileImage = formData.get('profileImage')
        const imageSize = 2 * 1024 * 1024 
        console.log(profileImage)

        if(!(profileImage.type === 'image/png' || profileImage.type === 'image/jpeg' || profileImage.type === 'image/jpg')){
            return NextResponse.json({
                message: "Only allowed png/jpg/jpeg format"
            }, { status: 400 })
        }

        if(profileImage.size > imageSize){
            return NextResponse.json({
                message: "Please compress your file, max 2mb"
            }, { status: 400 })
        }
        
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        const currentData = userDoc.data()
        
        console.log(currentData)
        
        let uploadedImageUrl = currentData.profileImage;
        if (profileImage) {
            if(currentData.profileImage.attachmentStoragePath){
                const deletedFile = await deleteExistingFile(`/profileImages/${userId}/${currentData.profileImage.originalFileName}`)

                console.log("deletedFile", deletedFile)

                if(deletedFile != null){
                    return NextResponse.json({
                        message: "Something went wrong when deleting the existing file"
                    }, { status: 503 })
                }
            }
            const uploadResult = await uploadSingleFile(profileImage, `/profileImages/${userId}/${profileImage.name}`);
            console.log("uploadResult", uploadResult)
            // if (!uploadResult) {
                //     return NextResponse.json({
                    //         message: "Something went wrong when uploading the file"
                    //     }, { status: 500 });
                    // }
                    uploadedImageUrl = uploadResult;
                    
                    if (uploadResult) {
                        await runTransaction(db, async (t) => {
                            t.update(userDocRef, {
                                fullName: fullName ?? currentData.fullName,
                                email: email ?? currentData.email,
                                jobPosition: jobPosition ?? currentData.jobPosition,
                                location: location ?? currentData.location,
                                profileImage: {
                                    attachmentStoragePath: uploadedImageUrl,
                                    originalFileName: profileImage.name
                        }
                    });
                });
            } else {
                return NextResponse.json({
                    message: "File upload failed, update not completed"
                }, { status: 500 });
            }
        }
        
        console.log("auth", auth.currentUser)
        const newUserDoc = await getDoc(userDocRef)
        
        // if (fullName && fullName !== auth.currentUser.displayName) {
            //     await updateProfile(auth.currentUser, {
        //         displayName: fullName
        //     });
        // }

        return NextResponse.json({
            data: {
                id: newUserDoc.id,
                ...newUserDoc.data()
            },
            message: "User profile updated successfully"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

