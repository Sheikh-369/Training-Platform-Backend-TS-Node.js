import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const createCategory = async (req: IExtendedRequest, res: Response) => {
    // const instituteNumber = req.user?.currentInstituteNumber;
    // const instituteNumber=req.user?.instituteNumber
    const instituteNumber = req.params.instituteNumber;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }
    console.log("✅ instituteNumber:", instituteNumber); // Add this for debugging
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
        res.status(400).json({
            message: "Please fill all the fields!"
        });
        return;
    }
    
    const categoryTable = `category_${instituteNumber}`;
    console.log("Using table:", categoryTable); // 👀 Debug log

    await sequelize.query(`INSERT INTO category_${instituteNumber} (
        categoryName, categoryDescription
    ) VALUES (?, ?)`, {
        type: QueryTypes.INSERT,
        replacements: [categoryName, categoryDescription]
    });

    res.status(200).json({
        message: "Category created successfully!",
        instituteNumber
    });
};

// const getAllCategories = async (req: IExtendedRequest, res: Response) => {
//     // const instituteNumber = req.user?.currentInstituteNumber;
//     const instituteNumber=req.user?.instituteNumber

//     const categories = await sequelize.query(`SELECT * FROM category_${instituteNumber}`, {
//         type: QueryTypes.SELECT
//     });

//     res.status(200).json({
//         message: "All categories fetched successfully!",
//         data: categories,
//         instituteNumber
//     });
// };
const getAllCategories = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.params.instituteNumber;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }

    // You might want some security check here:
    // e.g. check if req.user has permission for this instituteNumber

    const categories = await sequelize.query(`SELECT * FROM category_${instituteNumber}`, {
        type: QueryTypes.SELECT
    });

    res.status(200).json({
        message: "All categories fetched successfully!",
        data: categories,
        instituteNumber
    });
};

const getSingleCategory = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const categoryId = req.params.id;

    const category = await sequelize.query(`SELECT * FROM category_${instituteNumber} WHERE id = ?`, {
        replacements: [categoryId],
        type: QueryTypes.SELECT
    });

    res.status(200).json({
        message: "Single category fetched successfully!",
        data: category,
        instituteNumber
    });
};

const deleteCategory = async (req: IExtendedRequest, res: Response) => {
    // const instituteNumber = req.user?.currentInstituteNumber;
    const instituteNumber = req.params.instituteNumber;
    const categoryId = req.params.id;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }

    await sequelize.query(`DELETE FROM category_${instituteNumber} WHERE id = ?`, {
        type: QueryTypes.DELETE,
        replacements: [categoryId]
    });

    res.status(200).json({
        message: "Category deleted successfully!",
        instituteNumber
    });
};

const updateCategory = async (req: IExtendedRequest, res: Response) => {
    // const instituteNumber = req.user?.currentInstituteNumber;
    const instituteNumber = req.params.instituteNumber;
    const categoryId = req.params.id;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
        res.status(400).json({
            message: "Please fill all the fields!"
        });
        return;
    }

    await sequelize.query(`UPDATE category_${instituteNumber} 
        SET categoryName = ?, categoryDescription = ? 
        WHERE id = ?`, {
        type: QueryTypes.UPDATE,
        replacements: [categoryName, categoryDescription, categoryId]
    });

    res.status(200).json({
        message: "Category updated successfully!",
        instituteNumber
    });
};

export {createCategory,getAllCategories,getSingleCategory,deleteCategory,updateCategory};
