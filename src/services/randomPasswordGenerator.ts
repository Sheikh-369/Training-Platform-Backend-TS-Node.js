import bcrypt from "bcrypt"

const randomPasswordGenerator=(teacherName:string)=>{
    const randomNumber=Math.floor(1000+Math.random()*80000)
    const passwordData={
        hashedVersion:bcrypt.hashSync(`${randomNumber}_${teacherName}`,10),
        plainVersion:`${randomNumber}_${teacherName}`
    }
    return passwordData
}

export default randomPasswordGenerator