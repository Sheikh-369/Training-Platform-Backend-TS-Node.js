// import { Table, Model, Column, DataType, ForeignKey, Unique } from "sequelize-typescript";
// import User from "./userModel";

// @Table({
//   tableName: "userInstituteRoles",
//   modelName:"UserInstituteRole",
//   timestamps: true
// })
// // @Unique("user_institute_role_unique", ["userId", "instituteNumber", "role"])
// class UserInstituteRole extends Model {
//   @Column({
//     type: DataType.UUID,
//     defaultValue: DataType.UUIDV4,
//     primaryKey: true
//   })
//   declare id: string;

//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.UUID,
//     allowNull: false
//   })
//   declare userId: string;

//   @Column({
//     type: DataType.STRING,
//     allowNull: false
//   })
//   declare instituteNumber: string;

//   @Column({
//     type: DataType.ENUM("teacher", "student", "institute", "super-admin"),
//     allowNull: false
//   })
//   declare role: string;
// }
// export default UserInstituteRole;



import { Table, Model, Column, DataType, ForeignKey } from "sequelize-typescript";
import User from "./userModel";

@Table({
  tableName: "userInstituteRoles",
  modelName: "UserInstituteRole",
  timestamps: true
})
class UserInstituteRole extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare instituteNumber: string;

  @Column({
    type: DataType.ENUM("teacher", "student", "institute", "super-admin"),
    allowNull: false
  })
  declare role: string;

  // ✅ New columns
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare instituteName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare instituteAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare instituteImage: string;
}

export default UserInstituteRole;
