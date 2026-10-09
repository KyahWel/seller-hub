import type {
  CreateProductPayload,
  UpdateProductPayload,
} from '@org/contracts';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MAX_AMOUNT, MAX_QUANTITY } from '../common/limits';

/** Amounts are integer centavos. */
export class UpdateProductDto implements UpdateProductPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  cost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_QUANTITY)
  stock?: number;
}

export class CreateProductDto
  extends UpdateProductDto
  implements CreateProductPayload
{
  @IsUUID()
  sellerId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  declare name: string;

  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  declare price: number;
}
