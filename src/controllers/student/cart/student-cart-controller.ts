import { Response } from "express"
import { IExtendedRequest } from "../../../middleware/type"
import sequelize from "../../../database/connection"
import { QueryTypes } from "sequelize"


const insertIntoCartTableOfStudent = async(req:IExtendedRequest,res:Response)=>{
    const userId = req.user?.id  //user ko identity
    console.log(userId,"userId")
    const {instituteId,courseId} = req.body //kun course kinyo ra kun institute bata kinyo tesko lagi
    if(!instituteId || !courseId) {
        res.status(400).json({
            message : "Please provide instituteId and courseId!"
        })
        return
    }

    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_cart_${userId}(
            id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, 
            userId INT REFERENCES users(id),
            courseId INT REFERENCES course_${instituteId}(id),
            instituteId INT REFERENCES institute_${instituteId}(id), 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)

    await sequelize.query(`INSERT INTO student_cart_${userId}(courseId,instituteId,userId) VALUES(?,?,?)`,{
        type : QueryTypes.INSERT, 
        replacements : [courseId,instituteId,userId]
    })
    res.status(200).json({
        message : "Course Added To Cart Successfully!"
    })
}

const fetchStudentCartItems = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  let cartDatas = [];  //data collection

  //getting instituteID and courseId
  const datas: { instituteId: string; courseId: string }[] = await sequelize.query(
    `SELECT courseId,instituteId FROM student_cart_${userId} WHERE userId=?`,
    {
      type: QueryTypes.SELECT,
      replacements: [userId],
    }
  );

  //displaying each items of cart table
  for (let data of datas) {
    const test = await sequelize.query(
      `SELECT * FROM course_${data.instituteId} JOIN category_${data.instituteId} ON course_${data.instituteId}.categoryId = category_${data.instituteId}.id WHERE course_${data.instituteId}.id='${data.courseId}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (test.length > 0) {
      cartDatas.push(...test);
    } else {
      console.warn(`No course found with id ${data.courseId} in course_${data.instituteId}`);
    }
  }

  // Send response only once, after the loop
  res.status(200).json({
    message: "Cart Items Fetchd Successfully!",
    data: cartDatas,
  });
};



const deleteStudentCartItem = async(req:IExtendedRequest,res:Response)=>{
    const userId = req.user?.id
    const cartTableId = req.params.id; 

    if(!cartTableId){
        res.status(400).json({
            message : "Please provide cart table id"
        })
        return
    }

    await sequelize.query(`DELETE FROM student_cart_${userId} WHERE id=?`,{
        type : QueryTypes.DELETE, 
        replacements : [cartTableId]
    })
    res.status(200).json({
        message : "Item Deleted Successfully"
    })
}


export {insertIntoCartTableOfStudent,fetchStudentCartItems,deleteStudentCartItem}