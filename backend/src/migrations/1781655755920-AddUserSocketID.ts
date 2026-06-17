import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSocketID1781655755920 implements MigrationInterface {
  name = 'AddUserSocketID1781655755920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "socket_id" character varying DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'rider'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'user'`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "socket_id"`);
  }
}
