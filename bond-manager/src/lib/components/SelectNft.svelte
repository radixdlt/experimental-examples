<script lang="ts">
  import Select from '$lib/components/Select.svelte';
  import { dAppToolkit } from '$lib/stores/radix';

  export let accountAddress: string;
  export let selected: string;
  export let disabled: boolean = false;

  let nfts: { id: string; label: string }[] = [];

  $: {
    if (accountAddress) {
      $dAppToolkit?.gatewayApi.state
        .getEntityDetailsVaultAggregated([accountAddress], { explicitMetadata: ['name'] })
        .then(([response]) => {
          return Promise.all(
            response.non_fungible_resources.items
              .map((resource) => {
                return resource.vaults.items.map((vaultItem) => {
                  const nfts = (vaultItem.items || []).map((id) => {
                    return {
                      id,
                      resourceAddress: resource.resource_address,
                      address: `${resource.resource_address}:${id}`
                    };
                  });
                  return nfts;
                });
              })
              .flat(2)
              .map((nft) =>
                $dAppToolkit?.gatewayApi.state
                  .getNonFungibleData(nft.resourceAddress, nft.id)
                  .then((nftData) => {
                    const name: { value: string; field_name: string } | undefined = (
                      nftData.data?.programmatic_json as any
                    ).fields.find((nfData: any) => nfData.field_name === 'name');
                    return {
                      ...nft,
                      name: name?.value || 'Unnamed NFT'
                    };
                  })
              )
          );
        })
        .then((value) => {
          nfts = value
            .filter((item) => !!item)
            .map((item) => item!)
            .map((item) => ({ id: item.address, label: item.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
        });
    }
  }
</script>

<Select bind:selected items={nfts} {disabled} />
