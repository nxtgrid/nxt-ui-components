import { head, isNil, tail } from 'ramda';

export const formatPhone = phone => {
  if(!phone?.length) return '-';
  if(head(phone) === '+') return phone;
  return '+' + phone;
};

export const prepPhoneForEdit = phone => {
  if(isNil(phone)) return phone;
  if(head(phone) === '+') return tail(phone);
  return phone;
};

export const prepPhoneForSave = phone => {
  if(isNil(phone)) return phone;
  if(head(phone) === '+') return phone;
  return '+' + phone;
};
