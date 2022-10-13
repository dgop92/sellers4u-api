import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessCodeUnique1665606208443 implements MigrationInterface {
    name = 'BusinessCodeUnique1665606208443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_photo_entity" ("id" SERIAL NOT NULL, "url" character varying(160) NOT NULL, "imageId" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "productId" integer, CONSTRAINT "unique_image_id" UNIQUE ("imageId"), CONSTRAINT "PK_d69095d9972f37599b672caf3b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_entity" ("id" SERIAL NOT NULL, "name" character varying(130) NOT NULL, "description" text NOT NULL DEFAULT '', "code" character varying(50) NOT NULL, "price" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "categoryId" integer, "businessId" integer, CONSTRAINT "unique_business_code" UNIQUE ("code", "businessId"), CONSTRAINT "PK_6e8f75045ddcd1c389c765c896e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" ADD CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567" FOREIGN KEY ("productId") REFERENCES "product_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_641188cadea80dfe98d4c769ebf" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_entity" ADD CONSTRAINT "FK_d5707bbd8800803984fbc3d968d" FOREIGN KEY ("businessId") REFERENCES "business_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_d5707bbd8800803984fbc3d968d"`);
        await queryRunner.query(`ALTER TABLE "product_entity" DROP CONSTRAINT "FK_641188cadea80dfe98d4c769ebf"`);
        await queryRunner.query(`ALTER TABLE "product_photo_entity" DROP CONSTRAINT "FK_4181aa8d1a7ebbd0c87c0d43567"`);
        await queryRunner.query(`DROP TABLE "product_entity"`);
        await queryRunner.query(`DROP TABLE "product_photo_entity"`);
    }

}
