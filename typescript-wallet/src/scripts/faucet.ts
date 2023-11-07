import { radixEngineClient } from '../config'
import { logger } from '../helpers/logger'

radixEngineClient
  .getXrdFromFaucet()
  .map((res) => logger.debug(res))
  .mapErr((err) => logger.error(err))
