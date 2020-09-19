# Purgitory

Purge local branches that have been merged and deleted to the main branch in remote

![CircleCI](https://img.shields.io/circleci/build/github/sduduzog/purgitory/master?style=plastic)
![npm](https://img.shields.io/npm/v/purgitory?style=plastic)
![NPM](https://img.shields.io/npm/l/purgitory?style=plastic)

## Status

It kinda works, but because there are no tests, it's not stable at all

## Usage

```bash
$ npx purgitory
```

or

```bash
$ npm -g i purgitory

$ purgit --help
```

## Contribution

So far this is just code slapped together to make something work, it's far from perfect but there's great room for improvement, with the help from you.

To contribute, create an issue first, upon greenlight, you can submit a PR, this is to make sure that we don't work on the same thing at once, or you don't put all your hard work into something that contradicts plans I have for the project. Or you could pick out one of the TODO items as something you could tackle, I'd really appreciate it.
Anyways to get started, fork the repo and clone locally then do:

```bash
$ npm install
$ npm link
$ npm run dev
```

## TODO

- [ ] Unit tests, even just one
- [ ] Selecting branches to exclude from the merge
- [ ] Make this be a button away, via gui
- [ ] Option to force delete remote merged branches, if not yet deleted
