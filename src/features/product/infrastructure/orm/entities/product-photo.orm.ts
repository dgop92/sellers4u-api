import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from "typeorm";
import { ProductEntity } from "./product.orm";

@Entity()
@Unique("unique_image_id", ["imageId"])
export class ProductPhotoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 160, nullable: false })
  url: string;

  @Column("varchar", { length: 100, nullable: false })
  imageId: string;

  @ManyToOne(() => ProductEntity, (product) => product.photos, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ foreignKeyConstraintName: "fk_product_photo_product" })
  product: ProductEntity;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
