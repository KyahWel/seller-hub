import {
  type CreateBuyerPayload,
  PH_MOBILE_PATTERN,
  type UpdateBuyerPayload,
} from '@org/contracts';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateBuyerDto implements UpdateBuyerPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Matches(PH_MOBILE_PATTERN, {
    message: 'phone must be a Philippine mobile number',
  })
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

/** `sellerId` is not accepted: the gateway sets it from the session. */
export class CreateBuyerDto
  extends UpdateBuyerDto
  implements Omit<CreateBuyerPayload, 'sellerId'>
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare name: string;

  @Matches(PH_MOBILE_PATTERN, {
    message: 'phone must be a Philippine mobile number',
  })
  declare phone: string;
}
