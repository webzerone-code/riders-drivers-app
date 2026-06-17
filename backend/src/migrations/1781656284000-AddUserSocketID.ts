import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSocketID1781656284000 implements MigrationInterface {
  name = 'AddUserSocketID1781656284000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "socket_id" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "socket_id" SET DEFAULT false`,
    );
  }
}
