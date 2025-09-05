{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };

        devTools = [
          pkgs.alejandra
        ];

        commonTools = [
          pkgs.nodejs_22
          pkgs.pnpm_10
        ];
      in {
        devShells.default = pkgs.mkShell {
          packages = devTools ++ commonTools;
        };
      }
    );
}
