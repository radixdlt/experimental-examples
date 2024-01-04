# Bond manager

Bond manager demo dApp featured in [Learn About Radix's No-Code Issuing & Managing Tokens/NFTs](https://www.youtube.com/watch?v=IoJj2-bOPu4)



## Try it out

*  [Mainnet](https://d6464bfam5v04.cloudfront.net)
* [Stokenet](https://d29vf0dbb2lh7p.cloudfront.net)

# Local development server

**Run locally**

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```

# Deploy

**AWS Profile**

Follow this guide to setup an [AWS profile](https://sst.dev/chapters/create-an-iam-user.html)

Change AWS config in [sst.config.ts](sst.config.ts)

```javascript
  {
    name: 'bond-manager',
    region: 'eu-west-2',
    profile: 'NAME_OF_LOCAL_AWS_PROFILE',
    stage: 'dev'
  }
```

To deploy a production version of your app:

```bash
npm run sst:deploy
```

# License

The dApp is released under [Radix Modified MIT License](./LICENSE)
