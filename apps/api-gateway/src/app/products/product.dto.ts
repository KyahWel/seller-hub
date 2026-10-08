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
  MaxLength,
  Min,
} from 'class-validator';

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
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
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
  declare price: number;
}
