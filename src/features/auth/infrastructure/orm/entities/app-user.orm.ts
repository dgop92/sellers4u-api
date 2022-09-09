import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity()
@Unique("unique_firebase_user_id", ["firebaseUserId"])
export class AppUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 130, nullable: false, default: "" })
  firstName: string;

  @Column("varchar", { length: 130, nullable: false, default: "" })
  lastName: string;

  @Column("varchar", { length: 60, nullable: false })
  firebaseUserId: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
