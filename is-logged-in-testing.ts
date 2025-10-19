// const isLoggedIn=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
//     const token=req.headers.authorization

//     // if someone tries to create institute table without being logged in
//     if(!token){
//         res.status(401).json({
//             message:"Please provide token!"
//         })
//         return
//     }
//     jwt.verify(token,"Secret",async(error,success:any)=>{
//         // yadi token galat ayo vne
//         if(error){
//             res.status(403).json({
//                 message:"Invalid Token!"
//             })
//         }else{
//             // if id doesn't match
//             const userData = await User.findByPk(success.id)
           
//             if(!userData){
//                 res.status(403).json({
//                     message : "No user with that id, invalid token "
//                 })
//                 // if all fine
//             }else{
//                     // **Fetch institute role info**
//                 const userInstituteRole = await UserInstituteRole.findOne({
//                 where: { userId: success.id }
//                 });

//                 if (!userInstituteRole) {
//                 res.status(403).json({
//                     message: "No institute role found for this user"
//                 });
//                 return;
//                 }

//                 req.user = {
//                     id: userData.id,
//                     userEmail: userData.userEmail,
//                     role: userInstituteRole.role,
//                     instituteNumber:userInstituteRole.instituteNumber
//                 }
//                 next()//jumps to next step
//             }
//         }
//     })
// }