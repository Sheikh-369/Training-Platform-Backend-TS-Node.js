import { Table, Model, Column, DataType, ForeignKey, Unique } from "sequelize-typescript";
import User from "./userModel";

@Table({
  tableName: "userInstituteRoles",
  modelName:"UserInstituteRole",
  timestamps: true
})
// @Unique("user_institute_role_unique", ["userId", "instituteNumber", "role"])
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
    type: DataType.ENUM("teacher", "student", "admin", "super-admin"),
    allowNull: false
  })
  declare role: string;
}
export default UserInstituteRole;