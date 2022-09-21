import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusiness1663722810754 implements MigrationInterface {
  name = "AddBusiness1663722810754";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "business_entity" ("id" SERIAL NOT NULL, "name" character varying(130) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "appUserId" integer, CONSTRAINT "REL_c5093a6f8eb761eb5f7bf33d5e" UNIQUE ("appUserId"), CONSTRAINT "PK_611b70452c113fb6e68942bef03" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "business_entity" ADD CONSTRAINT "FK_c5093a6f8eb761eb5f7bf33d5ee" FOREIGN KEY ("appUserId") REFERENCES "app_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "business_entity" DROP CONSTRAINT "FK_c5093a6f8eb761eb5f7bf33d5ee"`
    );
    await queryRunner.query(`DROP TABLE "business_entity"`);
  }
}
