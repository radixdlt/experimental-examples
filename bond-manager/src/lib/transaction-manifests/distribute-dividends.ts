export const createDistributeDividendsTransactionManifest = ({
  accountAddress,
  resourceAddress,
  amount,
  amountPerRecipient,
  recipients
}: {
  accountAddress: string;
  resourceAddress: string;
  amount: string;
  amountPerRecipient: string;
  recipients: string[];
}) => {
  const depositToRecipients = recipients
    .map(
      (recipientAddress, index) => `TAKE_FROM_WORKTOP
        Address("${resourceAddress}")
        Decimal("${amountPerRecipient}")
        Bucket("bucket_${index}")
    ;
    CALL_METHOD
        Address("${recipientAddress}")
        "try_deposit_or_abort"
        Bucket("bucket_${index}")
        Enum<0u8>()
    ;`
    )
    .join('');

  const transactionManifest = `
    CALL_METHOD
      Address("${accountAddress}")
      "withdraw"
      Address("${resourceAddress}")
      Decimal("${amount}")
   ;
  
    ${depositToRecipients}`;

  console.log(transactionManifest);

  return transactionManifest;
};
