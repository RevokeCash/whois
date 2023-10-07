# @revoke.cash/whois

This repository contains a list of token data and contract/spender data. The data is used by the [revoke.cash](https://revoke.cash) website to display information about tokens and contracts. The scripts under `scripts/` are used to generate the data. We also have a list of manual labels under `data/manual` that gets merged with the generated data.

Data can be accessed through the following URLs:

```
https://raw.githubusercontent.com/RevokeCash/whois/master/data/generated/spenders/{chainId}/{address}.json
https://raw.githubusercontent.com/RevokeCash/whois/master/data/generated/tokens/{chainId}/{address}.json
```

## Sources

For token data, we get data from several different tokenlists, as well as CoinGecko's, 1inch's and Alchemy's APIs.

For spender data, we get data from ethereum-lists/contracts.

Besides these external sources, we also have a list of manual labels that we use to label contracts that are not covered by the external sources.

## Contributing

### Adding new manual spender labels

Contributions are very welcome! You can add a new manual label by creating a new file under `data/manual/spenders` with the following format:

`data/manual/spenders/<chainId>/<contractAddress>.json`

```json
{
  "name": "Name of the protocol this contract belongs to",
  "label": "Label of what this specific contract is"
}
```
