import type { CreateBuyerPayload, UpdateBuyerPayload } from '@org/contracts';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

/** Philippine mobile number: `09XXXXXXXXX` or `+639XXXXXXXXX`. */
const PH_MOBILE = /^(09|\+639)\d{9}$/;

export class UpdateBuyerDto implements UpdateBuyerPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Matches(PH_MOBILE, { message: 'phone must be a Philippine mobile number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CreateBuyerDto
  extends UpdateBuyerDto
  implements CreateBuyerPayload
{
  @IsUUID()
  sellerId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare name: string;

  @Matches(PH_MOBILE, { message: 'phone must be a Philippine mobile number' })
  declare phone: string;
}
