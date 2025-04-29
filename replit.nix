{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.replitPackages.nodemon
  ];
  env = {
    NODE_ENV = "production";
  };
}