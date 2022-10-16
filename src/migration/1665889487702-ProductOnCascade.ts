import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductOnCascade1665889487702 implements MigrationInterface {
    name = 'ProductOnCascade1665889487702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_photo_entity" DROP CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_641188cadea80dfe98d4c769ebf"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_d5707bbd8800803984fbc3d968d"`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" ADD CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567" FOREIGN KEY ("productId") REFERENCES "product_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_641188cadea80dfe98d4c769ebf" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_d5707bbd8800803984fbc3d968d" FOREIGN KEY ("businessId") REFERENCES "business_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_d5707bbd8800803984fbc3d968d"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_641188cadea80dfe98d4c769ebf"`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" DROP CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567"`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_d5707bbd8800803984fbc3d968d" FOREIGN KEY ("businessId") REFERENCES "business_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_641188cadea80dfe98d4c769ebf" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" ADD CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567" FOREIGN KEY ("productId") REFERENCES "product_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
