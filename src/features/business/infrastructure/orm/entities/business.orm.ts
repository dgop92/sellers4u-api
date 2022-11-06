import { AppUserEntity } from "@features/auth/infrastructure/orm/entities/app-user.orm";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export class BusinessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 130, nullable: false })
  name: string;

  @Column("varchar", { length: 100, nullable: false, default: "" })
  shortDescription: string;

  @Column("text", { nullable: false, default: "" })
  description: string;

  @OneToOne(() => AppUserEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  appUser?: AppUserEntity;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
