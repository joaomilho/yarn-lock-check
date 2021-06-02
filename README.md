# yarn-lock-check

This tool checks yarn locks in your repo for incorrect registries.

It reads the registry specified in your root .npmrc and compares it will all registries in the "resolved" section of all the libraries in all your yarn.lock files. If all match it returns, else it will throw an error showing all incorrect registries.

## Usage

### As a binary

```
yarn add yarn-lock-check
yarn yarn-lock-check
// or 
npx yarn-lock-check
```

### Programatic

Install: 

```sh
yarn add yarn-lock-check
```

Code: 

```js
import { yarnLockCheck } from 'yarn-lock-check

yarnLockCheck() // will use .npmrc
// or
yarnLockCheck('https://my.registry.com')
```