#!/bin/bash
set -e

nix develop --command pnpm compile
nix develop --command pnpm test
