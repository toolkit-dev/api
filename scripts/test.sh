#!/bin/bash
set -e

nix develop --command pnpm test
