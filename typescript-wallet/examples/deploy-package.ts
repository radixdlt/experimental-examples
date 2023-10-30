import { ResultAsync } from 'neverthrow'
import { deployPackage, loadBinaryFromPath, logger } from '../src/helpers'
import { radixEngineClient } from '../src/config'

const instantiateSugarPriceOracle = (sugarOraclePackage: string) =>
  radixEngineClient
    .getManifestBuilder()
    .andThen(
      ({ wellKnownAddresses, convertStringManifest, submitTransaction }) =>
        convertStringManifest(`
        CALL_METHOD
            Address("${wellKnownAddresses.accountAddress}")
            "lock_fee"
            Decimal("10")
        ;
        CALL_FUNCTION
            Address("${sugarOraclePackage}")
            "SugarPriceOracle"
            "instantiate_sugar_price_oracle"
        ;
        CALL_METHOD
            Address("${wellKnownAddresses.accountAddress}")
            "deposit_batch"
            Expression("ENTIRE_WORKTOP")
        ;
        `)
          .andThen(submitTransaction)
          .andThen(({ txId }) =>
            radixEngineClient.gatewayClient
              .pollTransactionStatus(txId)
              .map(() => txId)
          )
          .andThen((txId) =>
            radixEngineClient.gatewayClient
              .getCommittedDetails(txId)
              .map((res): string => res.createdEntities[0].entity_address)
          )
    )

ResultAsync.combine([
  loadBinaryFromPath('/examples/assets/sugar_price_oracle.wasm'),
  loadBinaryFromPath('/examples/assets/sugar_price_oracle.rpd'),
])
  .andThen(([wasmBuffer, rpdBuffer]) =>
    deployPackage({ wasmBuffer, rpdBuffer, lockFee: 100 })
  )
  .andThen((result) => {
    logger.info('Deployed package', result)
    return instantiateSugarPriceOracle(result.packageAddress)
  })
  .mapErr((error) => {
    logger.error(error)
  })
