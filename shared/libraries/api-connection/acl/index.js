import { splitWhen, equals } from 'ramda';
import { useAccountStore } from '../store/account';

/**
 * Hiding functionality based on ACL
 */

export const hideComponentByAcl = restrictedMemberTypes => {
  const myMemberType = useAccountStore().myProfile?.member?.member_type;
  // As long as we don't know the member, hide the component
  if(!myMemberType) return true;
  return !restrictedMemberTypes.includes(myMemberType);
};

export const blockByAcl = arr => {
  const myMemberType = useAccountStore().myProfile?.member?.member_type;
  // As long as we don't know the member, hide everything
  if(!myMemberType) return true;
  return arr?.includes(myMemberType);
};

export const filterItemsByAcl = items =>
  items.filter(({ aclHideFrom }) => !blockByAcl(aclHideFrom));


/**
 * Working with roles (member_types)
 */

const NXT_MEMBER_TYPES = [
  'SUPERADMIN',
  'FINANCE',
  'DEVELOPER',
  'TECH',
];

export const getMemberRolesToSet = () => {
  const myRole = useAccountStore().myProfile?.member?.member_type;
  // Ensures that member can't set roles higher in the array
  return splitWhen(equals(myRole), NXT_MEMBER_TYPES)[1];
};
