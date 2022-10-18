import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
  JoinColumn,
} from "typeorm";
import { CategoryEntity } from "./category.orm";
import { ProductPhotoEntity } from "./product-photo.orm";

@Entity()
@Unique("unique_business_code", ["code", "business"])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 130, nullable: false })
  name: string;

  @Column("text", { nullable: false, default: "" })
  description: string;

  @Column("varchar", { length: 50, nullable: false })
  code: string;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ foreignKeyConstraintName: "fk_product_category" })
  category?: CategoryEntity;

  @Column("integer", { nullable: false })
  price: number;

  @OneToMany(() => ProductPhotoEntity, (photo) => photo.product)
  photos?: ProductPhotoEntity[];

  @ManyToOne(() => BusinessEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ foreignKeyConstraintName: "fk_product_business" })
  business?: BusinessEntity;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
