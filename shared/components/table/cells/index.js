import { defineAsyncComponent } from 'vue';

export const tableCellMap = {
  TransformValue: defineAsyncComponent(() => import('./CellTransformValue.vue')),
  FormatText: defineAsyncComponent(() => import('./CellFormatText.vue')),
  DateTime: defineAsyncComponent(() => import('./CellDateTime.vue')),
  SenderReceiver: defineAsyncComponent(() => import('./CellSenderReceiver.vue')),
  AmountWithCurrency: defineAsyncComponent(() => import('./CellAmountWithCurrency.vue')),
  SmartOrderAmount: defineAsyncComponent(() => import('./CellSmartOrderAmount.vue')),
  OrderStatus: defineAsyncComponent(() => import('./CellOrderStatus.vue')),
  PhoneNumber: defineAsyncComponent(() => import('./CellPhoneNumber.vue')),
  Note: defineAsyncComponent(() => import('./CellNote.vue')),
  VerifyOrder: defineAsyncComponent(() => import('./CellVerifyOrder.vue')),
  FeesPaid: defineAsyncComponent(() => import('./CellFeesPaid.vue')),
  ConsumptionNever: defineAsyncComponent(() => import('./CellConsumptionNever.vue')),
  DeviceName: defineAsyncComponent(() => import('./CellDeviceName.vue')),
  FormatResultValue: defineAsyncComponent(() => import('./CellFormatResultValue.vue')),
  RetryInteraction: defineAsyncComponent(() => import('./CellRetryInteraction.vue')),
  MeteringHardwareStatus: defineAsyncComponent(() => import('./CellMeteringHardwareStatus.vue')),
};
