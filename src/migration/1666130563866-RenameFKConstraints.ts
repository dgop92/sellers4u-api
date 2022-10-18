import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFKConstraints1666130563866 implements MigrationInterface {
    name = 'RenameFKConstraints1666130563866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_photo_entity" DROP CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_641188cadea80dfe98d4c769ebf"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_d5707bbd8800803984fbc3d968d"`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" ADD CONSTRAINT "fk_product_photo_product" FOREIGN KEY ("productId") REFERENCES "product_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "fk_product_category" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "fk_product_business" FOREIGN KEY ("businessId") REFERENCES "business_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "fk_product_business"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "fk_product_category"`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" DROP CONSTRAINT "fk_product_photo_product"`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_d5707bbd8800803984fbc3d968d" FOREIGN KEY ("businessId") REFERENCES "business_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_641188cadea80dfe98d4c769ebf" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" ADD CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567" FOREIGN KEY ("productId") REFERENCES "product_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
