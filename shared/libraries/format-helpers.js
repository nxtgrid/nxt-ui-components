export const normalizeDirectiveStatus = status => {
  switch(status) {
    case 'SUCCESSFUL':
      return 'SUCCESSFUL';
    case 'FAILED':
    case 'IGNORED':
    case 'CANCELLED':
    case 'ABORTED':
    case 'TIMED_OUT':
      return 'FAILED';
    default:
      return 'PENDING';
  }
};
