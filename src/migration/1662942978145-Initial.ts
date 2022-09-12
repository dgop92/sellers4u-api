import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1662942978145 implements MigrationInterface {
  name = "Initial1662942978145";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_user_entity" ("id" SERIAL NOT NULL, "firstName" character varying(130) NOT NULL DEFAULT '', "lastName" character varying(130) NOT NULL DEFAULT '', "firebaseUserId" character varying(60) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "unique_firebase_user_id" UNIQUE ("firebaseUserId"), CONSTRAINT "PK_486b547032fd5113290b9dec557" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "app_user_entity"`);
  }
}
