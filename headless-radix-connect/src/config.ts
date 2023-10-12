export const config = {
  connectorClient: {
    signalingServerBaseUrl: 'wss://signaling-server.radixdlt.com',
    turnServers: [
      {
        urls: 'turn:turn-udp.radixdlt.com:80?transport=udp',
        username: 'username',
        credential: 'password',
      },
      {
        urls: 'turn:turn-tcp.radixdlt.com:80?transport=tcp',
        username: 'username',
        credential: 'password',
      },
    ],
  },
}
