import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ default: 'rider', nullable: true, name: 'user_type' }) // rider,driver
  userType: string;

  @Column({ default: false, nullable: true })
  status: boolean;

  @Column({ default: false, nullable: true })
  verified: boolean;

  @Column({
    default: 0,
    nullable: true,
    name: 'verification_code',
    //type: 'bigint',
  })
  verificationCode: string;

  @Column({ default: null, nullable: true, name: 'socket_id', type: 'varchar' })
  socketId: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
