import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  SALES_CHANNELS,
  type CreateOrderPayload,
  type OrderItem,
  type OrderStatus,
  type PaymentMethod,
  type SalesChannel,
  type UpdateOrderPayload,
} from '@org/contracts';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MAX_AMOUNT,
  MAX_ITEMS_PER_ORDER,
  MAX_QUANTITY,
} from '../common/limits';

/** Amounts are integer centavos. */
export class OrderItemDto implements OrderItem {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY)
  quantity!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  unitPrice!: number;
}

/** `sellerId` is not accepted: the gateway sets it from the session. */
export class CreateOrderDto implements Omit<CreateOrderPayload, 'sellerId'> {
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @IsIn(SALES_CHANNELS)
  channel!: SalesChannel;

  @IsIn(PAYMENT_METHODS)
  paymentMethod!: PaymentMethod;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ITEMS_PER_ORDER)
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_AMOUNT)
  shippingFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateOrderDto implements UpdateOrderPayload {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
