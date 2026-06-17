import { IsNumberString } from 'class-validator';

export class UpdateLocationDto {
  @IsNumberString()
  longitude: string;

  @IsNumberString()
  latitude: string;
}
