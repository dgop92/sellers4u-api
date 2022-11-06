import { MigrationInterface, QueryRunner } from "typeorm";

export class BusinessDescription1667749744495 implements MigrationInterface {
    name = 'BusinessDescription1667749744495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "business_entity" ADD "shortDescription" character varying(100) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "business_entity" ADD "description" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "business_entity" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "business_entity" DROP COLUMN "shortDescription"`);
    }

}
