# @revoke.cash/whois

This repository contains a list of token data and contract/spender data. The data is used by the [revoke.cash](https://revoke.cash) website to display information about tokens and contracts. The scripts under `scripts/` are used to generate the data. We also have a list of manual labels under `data/manual` that gets merged with the generated data.

## Contributing

### Adding new manual spender labels

Contributions are very welcome! You can add a new manual label by creating a new file under `data/manual/spenders` with the following format:

`data/manual/spenders/<chainId>/<contractAddress>.json`
```json
{
  "name": "Name of the protocol this contract belongs to",
  "label": "Label of what this specific contract is",
}
```
