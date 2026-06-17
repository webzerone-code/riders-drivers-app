import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable1780669071972 implements MigrationInterface {
  name = 'AlterUsersTable1780669071972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "verified" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "verification_code" character varying DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "verification_code"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verified"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
  }
}
