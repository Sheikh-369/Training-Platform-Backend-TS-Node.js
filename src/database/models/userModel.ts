import { Table,Model,Column,DataType } from "sequelize-typescript";

@Table({
    tableName:"users",
    modelName:"User",
    timestamps:true
})

class User extends Model{
    @Column({
        primaryKey:true,
        type:DataType.UUID,
        defaultValue:DataType.UUIDV4
    })
    declare id:string

    @Column({
        type:DataType.STRING
    })
    declare userName:string

    @Column({
        type:DataType.STRING,
        unique:true
    })
    declare userEmail:string

    @Column({
        type:DataType.STRING
    })
    declare userPassword:string

    @Column({
        type:DataType.ENUM(
            "teacher","student","institute","super-admin"
        ),
        defaultValue:"student"
    })
    declare role:string

    @Column({
        type:DataType.STRING
    })
    declare currentInstituteNumber:string
}

export default User
