import {
  ConnectorClient,
  NodeWebRTC,
  NodeWebSocket,
  createLogger,
} from '@radixdlt/radix-connect-webrtc'
import { config } from './config'
import express from 'express'
import QRCode from 'qrcode'
import { filter, tap, first } from 'rxjs/operators'
import { webcrypto } from 'node:crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const logger = createLogger(1)

const app = express()
const port = 3000

const getConnectionPasswordFromFile = () => {
  try {
    return fs.readFileSync(
      path.join(__dirname, '..', 'connection-password.txt'),
      {
        encoding: 'utf8',
      }
    )
  } catch (error) {}
}

app.get('/', (_, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Transfer-Encoding', 'chunked')

  const connectorClient = ConnectorClient({
    isInitiator: true,
    target: 'wallet',
    source: 'extension',
    dependencies: { WebRTC: NodeWebRTC(), WebSocket: NodeWebSocket() },
    logger,
  })

  connectorClient.setConnectionConfig(config.connectorClient)

  connectorClient.connect()

  const connectionPassword = getConnectionPasswordFromFile()

  if (!connectionPassword) {
    connectorClient.generateConnectionPassword().map((password) => {
      QRCode.toString(
        password.toString('hex'),
        {
          errorCorrectionLevel: 'H',
          type: 'svg',
          width: 500,
        },
        (err, data) => {
          if (err) throw err
          res.write(data)
        }
      )

      fs.writeFileSync(
        path.join(__dirname, '..', 'connection-password.txt'),
        password.toString('hex'),
        {
          encoding: 'utf8',
        }
      )

      connectorClient.setConnectionPassword(password)
    })
  } else {
    connectorClient.setConnectionPassword(
      Buffer.from(connectionPassword, 'hex')
    )
  }

  res.write('waiting for wallet connection... <br/>')

  connectorClient.connected$
    .pipe(
      filter((status) => status),
      tap(() => {
        connectorClient.sendMessage({
          interactionId: webcrypto.randomUUID(),
          metadata: {
            version: 2,
            networkId: 2,
            dAppDefinitionAddress:
              'account_tdx_2_12yf9gd53yfep7a669fv2t3wm7nz9zeezwd04n02a433ker8vza6rhe',
            origin: 'http://localhost:3000',
          },
          items: {
            discriminator: 'authorizedRequest',
            auth: {
              discriminator: 'loginWithoutChallenge',
            },
            ongoingAccounts: {
              numberOfAccounts: {
                quantifier: 'atLeast',
                quantity: 1,
              },
            },
          },
        })
      }),
      first()
    )
    .subscribe()

  connectorClient.onMessage$.pipe(first()).subscribe((message) => {
    logger.debug(message)
    res.write(`<pre>${JSON.stringify(message, null, 2)}</pre>`)
    connectorClient.destroy()
    res.end('')
  })
})

app.listen(port, () => {
  console.log(`Dev server running on http://localhost:${port}`)
})
