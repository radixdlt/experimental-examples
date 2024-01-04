export type Bond = { vaultAddress: string; bondNftId: string };

export const createRecallBondsTransactionManifest = ({
  accountAddress,
  proofResourceAddress,
  proofId,
  bonds,
  bondResourceAddress
}: {
  accountAddress: string;
  proofResourceAddress: string;
  proofId: string;
  bonds: Bond[];
  bondResourceAddress: string;
}) => {
  const recallBonds = bonds
    .map(
      ({ vaultAddress, bondNftId }) => `
      RECALL_NON_FUNGIBLES_FROM_VAULT 
          Address("${vaultAddress}") 
          Array<NonFungibleLocalId>(
              NonFungibleLocalId("${bondNftId}"),
          )
      ;
      `
    )
    .join('');

  const NonFungibleLocalIds = bonds
    .map(({ bondNftId }) => `NonFungibleLocalId("${bondNftId}")`)
    .join(', ');

  return `
  CALL_METHOD
      Address("${accountAddress}")
      "create_proof_of_non_fungibles"
      Address("${proofResourceAddress}")
      Array<NonFungibleLocalId>(
          NonFungibleLocalId("${proofId}")
      )
  ;

  ${recallBonds}

  TAKE_NON_FUNGIBLES_FROM_WORKTOP
      Address("${bondResourceAddress}")
      Array<NonFungibleLocalId>(
          ${NonFungibleLocalIds}
      )
      Bucket("bucket_of_bonds")
  ;

  CALL_METHOD
      Address("${accountAddress}")
      "try_deposit_or_abort"
      Bucket("bucket_of_bonds")
      Enum<0u8>()
  ;`;
};
