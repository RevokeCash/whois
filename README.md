# @revoke.cash/whois

This repository contains scripts to generate token and spender data for the [revoke.cash](https://revoke.cash) website. It also contains a list of manual labels that gets merged with the generated data.

## Usage

The generated files can be updated by running `yarn update:all`. This will generate new data and add it to the `generated` folder.

Then the generated data can be uploaded to an S3 bucket (or compatible storage) by running `yarn upload`. S3 endpoints / credentials can be configured by setting the appropriate environment variables.

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
