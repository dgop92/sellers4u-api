import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { ProductEntity } from "./product.orm";

@Entity()
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 130, nullable: false })
  name: string;

  @Column("text", { nullable: false, default: "" })
  description: string;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
