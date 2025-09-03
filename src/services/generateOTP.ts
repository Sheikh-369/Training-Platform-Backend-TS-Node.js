const generateOTP=()=>{
    return Math.floor(100 + Math.random()*9000)
}

export default generateOTP