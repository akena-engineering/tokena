# TOKENA

`Market` is a main contract with which user interacts.

To buy token call `buy` function sending ether amount of at least `minimumAmount`.

To sell token call `sell` specifying amount of tokens to sell and an account
to which ether should be transferred.

Contracts are deployed to Ropsten Network at following addresses:

| Contract | Address                                    |
| :------- | :----------------------------------------- |
| Token    | 0xb09AC73133818C8867cB34b1143E15DB4D814001 |
| Market   | 0xFa0741B29A0c1842D1f11e24208a0AbCf590de08 |

To get the artifacts of the contracts for Ropsten network run:

```sh
npm install --save-dev @akena/rambo-contracts@ropsten
```

The deployment artifacts can be found in `deployments/`.
Simple deployment data useful for web development can be found in the `export.json` file.
