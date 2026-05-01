/**
 * This method mirrors the install_status field in the meters_with_account_and_statuses view
 *
 * Returns
 *   SUCCESSFUL
 *   PENDING
 *   PROCESSING
 *   FAILED
 *   null
**/

export const compoundInstallStatus = (isGateway, importStatus, commissioningStatus) => {
  if(!importStatus) return 'SUCCESSFUL'; // Account for older hardware
  if(importStatus === 'PENDING' || commissioningStatus === 'PENDING') return 'WAITING';
  if(importStatus === 'PROCESSING' || commissioningStatus === 'PROCESSING') return 'PROCESSING';
  if(isGateway) {
    if(importStatus === 'SUCCESSFUL') return 'SUCCESSFUL';
    if(importStatus === 'FAILED') return 'FAILED';
  }
  else {
    if(commissioningStatus === 'SUCCESSFUL') return 'SUCCESSFUL';
    if(importStatus === 'FAILED' || commissioningStatus === 'FAILED' ||
      (importStatus === 'SUCCESSFUL' && !commissioningStatus)) return 'FAILED';
  }
  return null;
};

export const compoundInstallStatusPretty = (importStatus, commissioningStatus) => {
  if(!importStatus) return null; // Account for older meters

  if(importStatus === 'FAILED') return 'Import failed';
  if(importStatus === 'PENDING') return 'Waiting';
  if(importStatus !== 'SUCCESSFUL') return 'Installing';
  if(!commissioningStatus) return 'Commissioning not attempted';
  if(commissioningStatus === 'FAILED') return 'Commissioning failed';
  if(commissioningStatus !== 'SUCCESSFUL') return 'Commissioning';

  return null;
};
