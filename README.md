# Slugi

> Simple and configurable command-line tool to transform strings into web-friendly slugs

[![CI](https://github.com/miikkaylisiurunen/slugi/actions/workflows/ci.yml/badge.svg)](https://github.com/miikkaylisiurunen/slugi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@miikkaylisiurunen/slugi.svg?style=flat)](https://www.npmjs.com/package/@miikkaylisiurunen/slugi)

## Installation

Install Slugi globally using npm:

```bash
npm install -g @miikkaylisiurunen/slugi
```

## Usage

After installation, you can use the `slugi` command:

```
slugi <string> [options]
```

### Options

- `-r, --replacement`: Replacement character for spaces in the slug. Default: `-`.
- `-l, --lowercase`: Converts the slug to lowercase. Default: `false`.
- `-h, --help`: Displays help.
- `-v, --version`: Displays the version.

For example, to generate a slug with a custom replacement character and in lowercase, you can use:

```bash
slugi "Hello World" -r "_" -l
# Output: hello_world
```

## Examples

Transform a string into a slug with default options:

```bash
slugi "Hello World"
# Output: Hello-World
```

Transform a string with custom replacements and convert it to lowercase:

```bash
slugi "Hello World" -r "_" -l
# Output: hello_world
```

Show the help message:

```bash
slugi --help
```

Show the version:

```bash
slugi --version
```
