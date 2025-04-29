{ pkgs }: {
  deps = [
    pkgs.nodejs-16_x
    pkgs.nodePackages.typescript
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.replitPackages.nodemon
  ];
  env = {
    NODE_ENV = "production";
  };
}