import {MigrationInterface, QueryRunner} from "typeorm";

export class Report1647777335289 implements MigrationInterface {
    name = 'Report1647777335289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" ADD "status" character varying NOT NULL DEFAULT 'waiting'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "status"`);
    }

}
