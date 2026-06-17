import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersType1780677290137 implements MigrationInterface {
  name = 'AlterUsersType1780677290137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "userType" TO "user_type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "user_type" TO "userType"`,
    );
  }
}
